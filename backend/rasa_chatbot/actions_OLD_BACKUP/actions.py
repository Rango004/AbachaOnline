"""
WeGo RASA Custom Actions
Custom actions that interact with the WeGo backend API
"""

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import logging

logger = logging.getLogger(__name__)

# Backend API base URL
BACKEND_URL = "http://localhost:3000/api/v1"


class ActionCheckOrderStatus(Action):
    """Check the status of a customer's order"""

    def name(self) -> Text:
        return "action_check_order_status"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        # Get order_id from slot or entity
        order_id = tracker.get_slot("order_id")

        if not order_id:
            # Try to extract from latest message
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity.get("entity") == "order_id":
                    order_id = entity.get("value")
                    break

        if not order_id:
            dispatcher.utter_message(response="utter_ask_order_id")
            return []

        # Extract customer_id from sender_id (format: "customer_123")
        sender_id = tracker.sender_id
        customer_id = sender_id.split("_")[1] if "_" in sender_id else None

        if not customer_id:
            dispatcher.utter_message(text="Sorry, I couldn't identify your account. Please login and try again.")
            return []

        try:
            # Call WeGo backend webhook
            response = requests.post(
                f"{BACKEND_URL}/chatbot/webhook",
                json={
                    "action": "check_order_status",
                    "customer_id": customer_id,
                    "order_id": order_id
                },
                timeout=10
            )

            data = response.json()

            if data.get("success"):
                order = data.get("order")

                message = f"📦 Order {order['tracking_number']}:\n"
                message += f"Status: {order['status'].upper()}\n"
                message += f"Total: Le {order['total_amount']:,.2f}\n"

                if order['status'] == 'in_transit':
                    message += f"🚚 Expected delivery: {order.get('estimated_delivery', 'Soon')}"
                elif order['status'] == 'delivered':
                    message += f"✅ Delivered on {order.get('delivered_at', 'recently')}"
                elif order['status'] == 'pending':
                    message += "⏳ Your order is being processed"

                dispatcher.utter_message(text=message)
                return [SlotSet("order_id", order_id), SlotSet("order_found", True)]
            else:
                return [SlotSet("order_id", order_id), SlotSet("order_found", False)]

        except requests.exceptions.RequestException as e:
            logger.error(f"Error checking order status: {e}")
            dispatcher.utter_message(text="Sorry, I'm having trouble checking your order right now. Please try again later.")
            return [SlotSet("order_id", order_id), SlotSet("order_found", False)]


class ActionSearchProducts(Action):
    """Search for products in the WeGo marketplace"""

    def name(self) -> Text:
        return "action_search_products"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        # Try to extract product entity first
        product_query = None

        # Check for product_name entity
        entities = tracker.latest_message.get("entities", [])
        for entity in entities:
            if entity.get("entity") in ["product_name", "product_category"]:
                product_query = entity.get("value")
                break

        # If no entity found, use the full message as fallback
        if not product_query:
            product_query = tracker.latest_message.get("text")
            # Try to extract keywords by removing common words
            stop_words = ["find", "search", "show", "me", "i", "want", "to", "order",
                         "fɛn", "sach", "sho", "mi", "a", "want", "ɔda", "bay",
                         "looking", "for", "do", "you", "have", "una", "gɛt", "de", "luk", "fɔ"]
            words = product_query.lower().split()
            filtered_words = [w for w in words if w not in stop_words]
            if filtered_words:
                product_query = " ".join(filtered_words)

        sender_id = tracker.sender_id
        customer_id = sender_id.split("_")[1] if "_" in sender_id else None

        try:
            # Call WeGo backend webhook
            response = requests.post(
                f"{BACKEND_URL}/chatbot/webhook",
                json={
                    "action": "search_products",
                    "customer_id": customer_id,
                    "query": product_query
                },
                timeout=10
            )

            data = response.json()
            products = data.get("products", [])

            if products:
                message = f"🔍 I found {len(products)} product(s):\n\n"

                for i, product in enumerate(products[:5], 1):  # Show top 5
                    message += f"{i}. {product['name']}\n"
                    message += f"   💰 Le {product['price']:,.2f}\n"
                    message += f"   🏪 {product['merchant_name']}\n"
                    if product.get('stock_quantity', 0) > 0:
                        message += f"   ✅ In stock\n"
                    else:
                        message += f"   ❌ Out of stock\n"
                    message += "\n"

                if len(products) > 5:
                    message += f"...and {len(products) - 5} more. Visit the Products page to see all results."

                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text=f"No products found for '{product_query}'. Try different keywords.")

        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching products: {e}")
            dispatcher.utter_message(text="Sorry, I'm having trouble searching right now. Please try the Products page directly.")

        return [SlotSet("product_query", product_query)]


class ActionRequestRefund(Action):
    """Initiate a refund request for an order"""

    def name(self) -> Text:
        return "action_request_refund"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        order_id = tracker.get_slot("order_id")

        if not order_id:
            dispatcher.utter_message(text="Please provide your order tracking number to initiate a refund.")
            return []

        sender_id = tracker.sender_id
        customer_id = sender_id.split("_")[1] if "_" in sender_id else None

        try:
            response = requests.post(
                f"{BACKEND_URL}/chatbot/webhook",
                json={
                    "action": "request_refund",
                    "customer_id": customer_id,
                    "order_id": order_id
                },
                timeout=10
            )

            data = response.json()

            if data.get("success"):
                return [SlotSet("refund_status", "success")]
            else:
                error_message = data.get("message", "Unable to process refund request")
                logger.error(f"Refund failed for order {order_id}: {error_message}")
                return [SlotSet("refund_status", "failure")]

        except requests.exceptions.RequestException as e:
            logger.error(f"Error requesting refund: {e}")
            dispatcher.utter_message(text="Sorry, I couldn't process your refund request. Please contact support directly.")
            return [SlotSet("refund_status", "failure")]


class ActionEscalateToHuman(Action):
    """Escalate the conversation to a human customer support agent"""

    def name(self) -> Text:
        return "action_escalate_to_human"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        sender_id = tracker.sender_id
        customer_id = sender_id.split("_")[1] if "_" in sender_id else None

        # Get last 10 messages for context
        conversation_history = []
        for event in tracker.events:
            if event.get("event") == "user":
                conversation_history.append({
                    "sender": "user",
                    "text": event.get("text")
                })
            elif event.get("event") == "bot":
                conversation_history.append({
                    "sender": "bot",
                    "text": event.get("text")
                })

        try:
            response = requests.post(
                f"{BACKEND_URL}/chatbot/webhook",
                json={
                    "action": "escalate_to_human",
                    "customer_id": customer_id,
                    "conversation_history": conversation_history[-10:]
                },
                timeout=10
            )

            data = response.json()

            if data.get("success"):
                dispatcher.utter_message(
                    text="💬 Your chat session is now being transferred. Check your Messages for the conversation."
                )
                return [SlotSet("escalation_status", "success")]
            else:
                dispatcher.utter_message(
                    text="I'm having trouble connecting you right now. Please use the 'Messages' page to contact support."
                )
                return [SlotSet("escalation_status", "failure")]

        except requests.exceptions.RequestException as e:
            logger.error(f"Error escalating to human: {e}")
            dispatcher.utter_message(text="Unable to transfer to human support. Please try the Messages page.")
            return [SlotSet("escalation_status", "failure")]


class ActionGetMerchantInfo(Action):
    """Get information about a merchant"""

    def name(self) -> Text:
        return "action_get_merchant_info"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        merchant_id = tracker.get_slot("merchant_id")

        # Try to extract merchant name from entities
        merchant_name = None
        entities = tracker.latest_message.get("entities", [])
        for entity in entities:
            if entity.get("entity") == "merchant_name":
                merchant_name = entity.get("value")
                break

        try:
            response = requests.post(
                f"{BACKEND_URL}/chatbot/webhook",
                json={
                    "action": "get_merchant_info",
                    "merchant_id": merchant_id,
                    "merchant_name": merchant_name
                },
                timeout=10
            )

            data = response.json()

            if data.get("success"):
                merchant = data.get("merchant")

                message = f"🏪 {merchant['name']}\n"
                message += f"📍 Location: {merchant.get('location', 'Not specified')}\n"
                message += f"⭐ Rating: {merchant.get('rating', 'N/A')}\n"
                message += f"📦 Products: {merchant.get('product_count', 0)}\n"

                if merchant.get('contact'):
                    message += f"📞 Contact: {merchant['contact']}\n"

                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't find information about that merchant.")

        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting merchant info: {e}")
            dispatcher.utter_message(text="Unable to retrieve merchant information right now.")

        return []


class ActionDefaultFallback(Action):
    """Default fallback when bot doesn't understand"""

    def name(self) -> Text:
        return "action_default_fallback"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(response="utter_default")
        return []
