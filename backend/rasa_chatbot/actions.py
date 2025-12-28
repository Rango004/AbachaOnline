"""
RASA Custom Actions for WeGo Bilingual Chatbot
Integrates with WeGo backend database for real-time data
"""

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import psycopg2
import os
import urllib.parse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection settings
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'wego_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

def get_db_connection():
    """Create database connection"""
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print(f"[RASA Actions] Database connection error: {e}")
        return None


class ActionCheckOrderStatus(Action):
    """Check order status for customer"""

    def name(self) -> Text:
        return "action_check_order_status"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        order_id = tracker.get_slot("order_id")

        # Get customer_id from metadata (sent from backend)
        metadata = tracker.latest_message.get('metadata', {})
        customer_id = metadata.get('customer_id')

        if not customer_id:
            dispatcher.utter_message(text="Sorry, I couldn't identify your account. Please log in first.")
            return []

        if not order_id:
            dispatcher.utter_message(response="utter_ask_order_id")
            return []

        # Query database for order
        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, I'm having trouble connecting to the database. Please try again later.")
            return []

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT o.tracking_number, o.order_status, o.total_amount, o.delivery_address,
                       u.name as merchant_name
                FROM orders o
                LEFT JOIN users u ON o.merchant_id = u.id
                WHERE o.student_id = %s AND o.tracking_number = %s
            """, (customer_id, order_id))

            order = cursor.fetchone()

            if order:
                tracking_number, status, total_price, delivery_address, merchant_name = order

                # Format response (bilingual)
                status_msg = self._get_status_message(status)
                message = f"✅ **Order Found / Oda Don Fɛn**\n\n📦 Order ID / Oda ID: {tracking_number}\n📍 Status / Status: {status.upper()}\n💰 Total / Total: Le {total_price:,.0f}\n🏠 Delivery / Dilibri: {delivery_address}\n🏪 Merchant / Mɛchant: {merchant_name}\n\n{status_msg}"
                dispatcher.utter_message(text=message)
                return [SlotSet("order_found", True)]
            else:
                dispatcher.utter_message(response="utter_no_order_found")
                return [SlotSet("order_found", False)]

        except Exception as e:
            print(f"[RASA Actions] Error checking order: {e}")
            dispatcher.utter_message(text="Sorry, an error occurred while checking your order.")
            return []
        finally:
            if conn:
                conn.close()

    def _get_status_message(self, status: str) -> str:
        """Get status-specific message"""
        status_messages = {
            'pending': 'Your order is being prepared. / Yu oda de mek rɛdi.',
            'confirmed': 'Your order has been confirmed! / Dɛn dɔn kɔnfam yu oda!',
            'in_transit': 'Your order is on the way! / Yu oda de kam!',
            'delivered': 'Your order has been delivered! / Yu oda dɔn rich!',
            'cancelled': 'This order was cancelled. / Dɛn dɔn kansɛl dis oda.'
        }
        return status_messages.get(status, 'Status update available. / Status update de.')


class ActionSearchProducts(Action):
    """Search for products"""

    def name(self) -> Text:
        return "action_search_products"

    def _normalize_product_name(self, query: str) -> str:
        """Convert Krio product names to English and normalize"""
        # Krio to English mappings
        krio_to_english = {
            'wata': 'water',
            'rais': 'rice',
            'fon': 'phone',
            'bred': 'bread',
            'suga': 'sugar',
            'milk': 'milk',
            'ti': 'tea',
            'kɔfi': 'coffee',
            'jus': 'juice',
            'sup': 'soap',
            'sɔp': 'soap',
            'oyl': 'oil',
            'fut': 'food',
            'mit': 'meat',
            'fish': 'fish',
            'eg': 'egg',
            'tomato': 'tomato',
            'ɔniɔn': 'onion',
            'pɛpɛ': 'pepper'
        }

        query_lower = query.lower().strip()
        return krio_to_english.get(query_lower, query_lower)

    def _extract_search_term(self, message: str) -> str:
        """Extract the actual search term from user message, ignoring command words"""
        import re

        # Common search command patterns (English + Krio)
        patterns = [
            r'(?:find|search|show|get|look for|looking for|search for|show me|give me|get me)\s+(.+)',
            r'(?:fɛn|fen|sho mi|luk fɔ|sach fɔ|gɛt mi)\s+(.+)',
            r'(?:where can i find|do you have|i need|i want|buy)\s+(.+)',
            r'(?:usai a go fɛn|yu gɛt|a nid|a want|bay)\s+(.+)',
        ]

        message_lower = message.lower().strip()

        for pattern in patterns:
            match = re.search(pattern, message_lower, re.IGNORECASE)
            if match:
                extracted = match.group(1).strip()
                # Remove trailing punctuation
                extracted = re.sub(r'[?.!]+$', '', extracted).strip()
                return extracted

        # If no pattern matched, return the message minus common stop words
        stop_words = ['find', 'search', 'show', 'get', 'me', 'for', 'a', 'the', 'some',
                      'fɛn', 'fen', 'sho', 'mi', 'fɔ', 'sach']
        words = message_lower.split()
        filtered = [w for w in words if w not in stop_words]
        return ' '.join(filtered) if filtered else message_lower

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get customer_id from metadata
        metadata = tracker.latest_message.get('metadata', {})
        customer_id = metadata.get('customer_id')

        # IMPORTANT: Extract search term directly from user message first
        # This avoids slot caching issues where old slot values override new searches
        user_message = tracker.latest_message.get('text', '')

        # Extract the actual search term from the message
        extracted_term = self._extract_search_term(user_message)

        # Only use slot values if extraction resulted in nothing meaningful
        if not extracted_term or len(extracted_term.strip()) < 2:
            product_name = tracker.get_slot("product_name")
            product_category = tracker.get_slot("product_category")
            search_query = product_name or product_category or user_message
        else:
            search_query = extracted_term

        if not search_query or len(search_query.strip()) < 2:
            dispatcher.utter_message(text="What product are you looking for? Try 'rice', 'water', 'phones', etc.\n\nWetin yu de luk fɔ? Trai 'rais', 'wata', 'fon', etc.")
            return [SlotSet("product_name", None), SlotSet("product_category", None)]

        # Normalize Krio to English
        normalized_query = self._normalize_product_name(search_query)

        print(f"[RASA Search] User message: '{user_message}' -> Extracted: '{extracted_term}' -> Normalized: '{normalized_query}'")

        # Query database
        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, I'm having trouble connecting to the database.")
            return [SlotSet("product_name", None), SlotSet("product_category", None)]

        try:
            cursor = conn.cursor()

            # First try exact/partial match on the normalized query
            cursor.execute("""
                SELECT p.id, p.name, p.price, p.description, p.is_active,
                       u.name as merchant_name,
                       CASE
                         WHEN LOWER(p.name) = LOWER(%s) THEN 0
                         WHEN p.name ILIKE %s THEN 1
                         WHEN p.category ILIKE %s THEN 2
                         WHEN p.description ILIKE %s THEN 3
                         ELSE 4
                       END as relevance
                FROM products p
                LEFT JOIN users u ON p.merchant_id = u.id
                WHERE (p.name ILIKE %s OR p.description ILIKE %s OR p.category ILIKE %s)
                AND p.is_active = true
                ORDER BY relevance ASC, p.created_at DESC
                LIMIT 10
            """, (normalized_query, f'%{normalized_query}%', f'%{normalized_query}%', f'%{normalized_query}%',
                  f'%{normalized_query}%', f'%{normalized_query}%', f'%{normalized_query}%'))

            products = cursor.fetchall()

            # If no results, try searching by individual words (for multi-word queries)
            if not products and ' ' in normalized_query:
                words = normalized_query.split()
                for word in words:
                    if len(word) >= 3:  # Only try words with 3+ characters
                        cursor.execute("""
                            SELECT p.id, p.name, p.price, p.description, p.is_active,
                                   u.name as merchant_name, 5 as relevance
                            FROM products p
                            LEFT JOIN users u ON p.merchant_id = u.id
                            WHERE (p.name ILIKE %s OR p.category ILIKE %s)
                            AND p.is_active = true
                            ORDER BY p.created_at DESC
                            LIMIT 10
                        """, (f'%{word}%', f'%{word}%'))
                        products = cursor.fetchall()
                        if products:
                            print(f"[RASA Search] Found products using word: '{word}'")
                            break

            # If still no results, try removing common suffixes (light -> torch, etc.)
            if not products:
                # Try common word variations
                variations = []
                if normalized_query.endswith('light'):
                    variations.append(normalized_query.replace('light', ''))
                    variations.append('torch')
                    variations.append('flashlight')
                if normalized_query.endswith('s'):
                    variations.append(normalized_query[:-1])  # Remove plural 's'

                for variation in variations:
                    if variation and len(variation) >= 3:
                        cursor.execute("""
                            SELECT p.id, p.name, p.price, p.description, p.is_active,
                                   u.name as merchant_name, 6 as relevance
                            FROM products p
                            LEFT JOIN users u ON p.merchant_id = u.id
                            WHERE p.name ILIKE %s AND p.is_active = true
                            ORDER BY p.created_at DESC
                            LIMIT 10
                        """, (f'%{variation}%',))
                        products = cursor.fetchall()
                        if products:
                            print(f"[RASA Search] Found products using variation: '{variation}'")
                            break

            if products:
                message_parts = [f"🔍 **Found {len(products)} products / Fɛn {len(products)} prɔdak**\n"]

                for idx, product in enumerate(products, 1):
                    product_id, name, price, description, is_available, merchant_name, relevance = product
                    product_info = f"{idx}. **{name}**\n   💰 Le {price:,.0f}\n   🏪 {merchant_name}"
                    if description:
                        desc_short = description[:60] + "..." if len(description) > 60 else description
                        product_info += f"\n   📝 {desc_short}"
                    message_parts.append(product_info)

                message_parts.append("\nTo order, say: 'I want to order [product name]'\nFɔ ɔda, se: 'A want ɔda [prɔdak nem]'")
                message = "\n\n".join(message_parts)

                dispatcher.utter_message(text=message)
                # Clear the slot to prevent caching for next search
                return [SlotSet("product_name", None), SlotSet("product_category", None)]
            else:
                # No products found - give a helpful message with the actual search term
                message = f"❌ No products found for '**{search_query}**'.\n\nTry different keywords like 'food', 'electronics', 'water', 'rice'.\n\n---\n\nNɔ prɔdak fɔn fɔ '**{search_query}**'.\n\nTrai difrɛnt wɔd lɛk 'fut', 'ilɛktrɔnik', 'wata', 'rais'."
                dispatcher.utter_message(text=message)
                # Clear the slot to prevent caching for next search
                return [SlotSet("product_name", None), SlotSet("product_category", None)]

        except Exception as e:
            print(f"[RASA Actions] Error searching products: {e}")
            dispatcher.utter_message(text="Sorry, an error occurred while searching for products.")
            return [SlotSet("product_name", None), SlotSet("product_category", None)]
        finally:
            if conn:
                conn.close()


class ActionGetProductPrice(Action):
    """Get price for a specific product"""

    def name(self) -> Text:
        return "action_get_product_price"

    def _normalize_product_name(self, query: str) -> str:
        """Convert Krio product names to English and normalize"""
        # Krio to English mappings
        krio_to_english = {
            'wata': 'water',
            'rais': 'rice',
            'fon': 'phone',
            'bred': 'bread',
            'suga': 'sugar',
            'milk': 'milk',
            'ti': 'tea',
            'kɔfi': 'coffee',
            'jus': 'juice',
            'sup': 'soap',
            'sɔp': 'soap',
            'oyl': 'oil',
            'fut': 'food',
            'mit': 'meat',
            'fish': 'fish',
            'eg': 'egg',
            'tomato': 'tomato',
            'ɔniɔn': 'onion',
            'pɛpɛ': 'pepper'
        }

        query_lower = query.lower().strip()
        return krio_to_english.get(query_lower, query_lower)

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        product_name = tracker.get_slot("product_name")

        if not product_name:
            dispatcher.utter_message(text="Which product's price would you like to know?\n\nWetin prɔdak yu want no di prais?")
            return []

        # Normalize Krio to English
        normalized_name = self._normalize_product_name(product_name)

        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()
            # Prioritize exact name matches first
            cursor.execute("""
                SELECT name, price, is_active
                FROM products
                WHERE name ILIKE %s AND is_active = true
                ORDER BY
                  CASE WHEN name ILIKE %s THEN 0 ELSE 1 END,
                  created_at DESC
                LIMIT 1
            """, (f'%{normalized_name}%', normalized_name))

            product = cursor.fetchone()

            if product:
                name, price, is_available = product
                message = f"💰 **{name}** costs **Le {price:,.0f}**\n\n{name} na **Le {price:,.0f}**"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text=f"Sorry, I couldn't find pricing for '{product_name}'.\n\nA nɔ fɛn prais fɔ '{product_name}'.")

        except Exception as e:
            print(f"[RASA Actions] Error getting price: {e}")
            dispatcher.utter_message(text="Error retrieving price information.")
        finally:
            if conn:
                conn.close()

        return []


class ActionCheckProductAvailability(Action):
    """Check if product is available"""

    def name(self) -> Text:
        return "action_check_product_availability"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        product_name = tracker.get_slot("product_name")

        if not product_name:
            dispatcher.utter_message(text="Which product would you like to check?\n\nWetin prɔdak yu want chɛk?")
            return []

        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT name, is_active, stock_quantity
                FROM products
                WHERE name ILIKE %s
                LIMIT 1
            """, (f'%{product_name}%',))

            product = cursor.fetchone()

            if product:
                name, is_available, stock_quantity = product
                if is_available:
                    message = f"✅ **{name}** is available! Stock: {stock_quantity if stock_quantity else 'In stock'}\n\n{name} de! I de na stɔk."
                else:
                    message = f"❌ **{name}** is currently out of stock.\n\n{name} nɔ de na stɔk naw."
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text=f"I couldn't find '{product_name}' in our inventory.\n\nA nɔ fɛn '{product_name}'.")

        except Exception as e:
            print(f"[RASA Actions] Error checking availability: {e}")
            dispatcher.utter_message(text="Error checking availability.")
        finally:
            if conn:
                conn.close()

        return []


class ActionGetProductDetails(Action):
    """Get detailed product information"""

    def name(self) -> Text:
        return "action_get_product_details"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        product_name = tracker.get_slot("product_name")

        if not product_name:
            dispatcher.utter_message(text="Which product details would you like?\n\nWetin prɔdak yu want ditels fɔ?")
            return []

        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.name, p.description, p.price, p.category, p.is_active,
                       u.name as merchant_name, u.phone
                FROM products p
                LEFT JOIN users u ON p.merchant_id = u.id
                WHERE p.name ILIKE %s
                LIMIT 1
            """, (f'%{product_name}%',))

            product = cursor.fetchone()

            if product:
                name, description, price, category, is_available, merchant_name, phone = product

                available_text = 'Yes / Ya' if is_available else 'No / Nɔ'
                message = f"📦 **Product Details / Prɔdak Ditels**\n\n**{name}**\n💰 Price: Le {price:,.0f}\n📁 Category: {category or 'General'}\n📝 Description: {description or 'No description available'}\n✅ Available: {available_text}\n\n🏪 Merchant: {merchant_name}\n📞 Contact: {phone or 'N/A'}"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text=f"I couldn't find details for '{product_name}'.\n\nA nɔ fɛn ditels fɔ '{product_name}'.")

        except Exception as e:
            print(f"[RASA Actions] Error getting product details: {e}")
            dispatcher.utter_message(text="Error retrieving product details.")
        finally:
            if conn:
                conn.close()

        return []


def extract_product_from_order_message(message: str) -> str:
    """Extract product name from order message - shared utility function"""
    import re

    # Patterns to extract product from order messages (more specific patterns first!)
    patterns = [
        # Most specific patterns first
        r'i\s+want\s+to\s+order\s+(.+?)(?:\s+please)?$',
        r'i\s+want\s+to\s+buy\s+(.+?)(?:\s+please)?$',
        r'i\'?d?\s+like\s+to\s+(?:order|buy)\s+(.+?)(?:\s+please)?$',
        r'can\s+i\s+(?:get|order|buy)\s+(.+?)(?:\s+please)?$',
        r'please\s+order\s+(.+?)(?:\s+for\s+me)?$',
        r'a\s+want\s+(?:to\s+)?(?:ɔda|oda|bay)\s+(.+?)$',
        r'a\s+wan\s+(?:bay|ɔda|oda)\s+(.+?)$',
        # Less specific patterns
        r'(?:order|buy|purchase)\s+(.+?)(?:\s+please)?$',
        r'(?:ɔda|bay|gɛt)\s+(.+?)$',
        r'get\s+me\s+(.+?)$',
        r'add\s+(.+?)\s+to\s+(?:my\s+)?cart',
    ]

    message_lower = message.lower().strip()

    for pattern in patterns:
        match = re.search(pattern, message_lower, re.IGNORECASE)
        if match:
            extracted = match.group(1).strip()
            # Remove trailing punctuation
            extracted = re.sub(r'[?.!]+$', '', extracted).strip()
            # Remove common filler words at the start
            extracted = re.sub(r'^(?:a\s+|an\s+|some\s+|the\s+)', '', extracted).strip()
            if extracted and len(extracted) >= 2:
                return extracted

    return None


class ActionConfirmOrder(Action):
    """Extract product name and ask for order confirmation"""

    def name(self) -> Text:
        return "action_confirm_order"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_message = tracker.latest_message.get('text', '')

        # Try to extract product name from message first
        extracted_product = extract_product_from_order_message(user_message)

        # Fall back to slot if extraction failed
        product_name = extracted_product or tracker.get_slot("product_name")

        print(f"[RASA ConfirmOrder] Message: '{user_message}' -> Extracted: '{extracted_product}' -> Slot: '{tracker.get_slot('product_name')}' -> Using: '{product_name}'")

        if not product_name:
            dispatcher.utter_message(text="Which product would you like to order?\n\nWetin prɔdak yu want ɔda?")
            return [SlotSet("product_name", None)]

        # Set the slot and ask for confirmation
        message = f"Just to confirm, you want to order **{product_name}**? Reply 'yes' to confirm or 'no' to cancel.\n\nFɔ kɔnfam, yu want fɔ ɔda **{product_name}**? Ansa 'yes' fɔ kɔnfam ɔ 'no' fɔ kansɛl."
        dispatcher.utter_message(text=message)

        return [SlotSet("product_name", product_name)]


class ActionOrderProduct(Action):
    """Place an order for a product"""

    def name(self) -> Text:
        return "action_order_product"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # The product_name should already be set by action_confirm_order
        # But we also try to extract from message as a fallback
        user_message = tracker.latest_message.get('text', '')

        # Use slot first (set by action_confirm_order), fallback to extraction
        product_name = tracker.get_slot("product_name")

        # If no slot value, try extraction (handles direct order without confirmation)
        if not product_name:
            product_name = extract_product_from_order_message(user_message)

        print(f"[RASA Order] Message: '{user_message}' -> Slot: '{tracker.get_slot('product_name')}' -> Using: '{product_name}'")

        # Get customer_id from metadata
        metadata = tracker.latest_message.get('metadata', {})
        customer_id = metadata.get('customer_id')

        if not customer_id:
            dispatcher.utter_message(text="Please log in to place an order.\n\nDuya log in fɔ ɔda.")
            return [SlotSet("product_name", None)]

        if not product_name:
            dispatcher.utter_message(text="Which product would you like to order?\n\nWetin prɔdak yu want ɔda?")
            return [SlotSet("product_name", None)]

        # In a real implementation, this would create an order in the database
        # For now, provide instructions to order through the main app

        # URL-encode the product name for the search link
        encoded_product = urllib.parse.quote(product_name)

        message = f"✅ Great choice! To complete your order for **{product_name}**:\n\n🔗 [Click here to find {product_name}](/products?search={encoded_product})\n\nOr follow these steps:\n1. Go to the Products page\n2. Find {product_name}\n3. Add to cart and checkout\n\n💬 Say \"talk to human\" to speak with a merchant directly.\n\n---\n\nGud chɔys! Fɔ kɔmplit yu ɔda fɔ **{product_name}**:\n\n🔗 [Klik ya fɔ fɛn {product_name}](/products?search={encoded_product})\n\nƆ fala dɛn stɛp ya:\n1. Go na di Prɔdaks pej\n2. Fɛn {product_name}\n3. Put am na kat ɛn chɛk awt\n\n💬 Se \"tɔk to pɔsin\" fɔ tɔk to mɛchant dirɛkt."

        dispatcher.utter_message(text=message)
        # Clear the slot to prevent caching issues
        return [SlotSet("order_placed", True), SlotSet("product_name", None)]


class ActionRequestRefund(Action):
    """Request a refund for an order"""

    def name(self) -> Text:
        return "action_request_refund"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        order_id = tracker.get_slot("order_id")

        # Get customer_id from metadata
        metadata = tracker.latest_message.get('metadata', {})
        customer_id = metadata.get('customer_id')

        if not customer_id:
            dispatcher.utter_message(text="Please log in first.\n\nDuya log in fɔs.")
            return []

        if not order_id:
            dispatcher.utter_message(text="Please provide your order number for the refund.\n\nGi mi yu oda nɔmba fɔ di rifɔnd.")
            return []

        # Check if order exists and is eligible for refund
        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()
            # Get order with merchant info
            cursor.execute("""
                SELECT o.tracking_number, o.order_status, o.merchant_id, u.name as merchant_name
                FROM orders o
                LEFT JOIN users u ON o.merchant_id = u.id
                WHERE o.student_id = %s AND o.tracking_number = %s
            """, (customer_id, order_id))

            order = cursor.fetchone()

            if order:
                tracking_number, status, merchant_id, merchant_name = order

                if status in ['delivered', 'cancelled']:
                    # Order is delivered/cancelled - provide chat options
                    status_text = "delivered" if status == "delivered" else "cancelled"
                    message = f"This order ({tracking_number}) has been **{status_text}**.\n\n📋 **For refund assistance, please choose:**\n\n[💬 Chat with {merchant_name or 'Merchant'}](#chat-merchant-{merchant_id})\n\n[💬 Chat with AbachaOnline Admin](#chat-admin)\n\n---\n\nDis oda ({tracking_number}) dɔn **{status_text}**.\n\n📋 **Fɔ rifɔnd ɛp, duya pik:**\n\n[💬 Tɔk to {merchant_name or 'Mɛchant'}](#chat-merchant-{merchant_id})\n\n[💬 Tɔk to AbachaOnline Admin](#chat-admin)"
                    dispatcher.utter_message(text=message)
                    return [SlotSet("refund_status", "escalated_to_merchant")]
                else:
                    # Order is still in progress - can be cancelled/refunded
                    cursor.execute("""
                        UPDATE orders
                        SET order_status = 'cancelled'
                        WHERE tracking_number = %s
                    """, (order_id,))
                    conn.commit()

                    message = f"✅ **Refund Request Submitted / Rifɔnd Rikwɛst Dɔn Sɛnd**\n\nYour refund for order **{tracking_number}** has been initiated.\n\n📧 You'll receive confirmation within 24 hours\n💰 Refunds are processed in 3-5 business days\n\n---\n\nYu rifɔnd fɔ oda **{tracking_number}** dɔn stat.\n\n📧 Yu go gɛt kɔnfamɛshɔn insay 24 awa\n💰 Rifɔnd de prosɛs insay 3-5 biznɛs de"
                    dispatcher.utter_message(text=message)
                    return [SlotSet("refund_status", "initiated")]
            else:
                message = f"❌ **Order Not Found / Oda Nɔ Fɔn**\n\nI couldn't find order **{order_id}** in your account.\n\n[💬 Chat with AbachaOnline Admin](#chat-admin)\n\n---\n\nA nɔ fɛn oda **{order_id}** na yu akɔnt.\n\n[💬 Tɔk to AbachaOnline Admin](#chat-admin)"
                dispatcher.utter_message(text=message)
                return [SlotSet("refund_status", "order_not_found")]

        except Exception as e:
            print(f"[RASA Actions] Error requesting refund: {e}")
            dispatcher.utter_message(text="Error processing refund request.")
            return [SlotSet("refund_status", "error")]
        finally:
            if conn:
                conn.close()


class ActionEscalateToHuman(Action):
    """Escalate conversation to human agent"""

    def name(self) -> Text:
        return "action_escalate_to_human"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get customer_id from metadata
        metadata = tracker.latest_message.get('metadata', {})
        customer_id = metadata.get('customer_id')

        if not customer_id:
            message = "I'd love to connect you with a human agent, but you'll need to log in first.\n\n📱 Please log in to your WeGo account to access live support.\n\n---\n\nA want kɔnɛkt yu to pɔsin, bɔt yu fɔ log in fɔs.\n\n📱 Duya log in to yu WeGo akɔnt fɔ gɛt layv sɔpɔt."
        else:
            # Provide clickable buttons for chat options
            message = "👋 **Who would you like to chat with?**\n\nClick below to start a conversation:\n\n[💬 Chat with AbachaOnline Admin](#chat-admin)\n\n---\n\n👋 **Udat yu want tɔk to?**\n\nKlik bilow fɔ stat tɔkin:\n\n[💬 Tɔk to AbachaOnline Admin](#chat-admin)"

        dispatcher.utter_message(text=message)
        return [SlotSet("escalation_status", "initiated")]


class ActionGetMerchantInfo(Action):
    """Get merchant information"""

    def name(self) -> Text:
        return "action_get_merchant_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        merchant_name = tracker.get_slot("merchant_name")

        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()

            if merchant_name:
                cursor.execute("""
                    SELECT u.id, u.name, u.phone
                    FROM users u
                    WHERE u.role = 'merchant' AND u.name ILIKE %s
                    LIMIT 1
                """, (f'%{merchant_name}%',))
            else:
                # Get a random active merchant
                cursor.execute("""
                    SELECT u.id, u.name, u.phone
                    FROM users u
                    WHERE u.role = 'merchant'
                    LIMIT 1
                """)

            merchant = cursor.fetchone()

            if merchant:
                merchant_id, name, phone = merchant

                message = f"🏪 **Merchant Information / Mɛchant Infɔmɛshɔn**\n\n**{name}**\n📞 Phone: {phone or 'N/A'}\n\nClick below to chat with this merchant:\n\n[💬 Chat with {name}](#chat-merchant-{merchant_id})"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't find merchant information.\n\nA nɔ fɛn mɛchant infɔmɛshɔn.")

        except Exception as e:
            print(f"[RASA Actions] Error getting merchant info: {e}")
            dispatcher.utter_message(text="Error retrieving merchant information.")
        finally:
            if conn:
                conn.close()

        return []


class ActionCompareProducts(Action):
    """Compare multiple products"""

    def name(self) -> Text:
        return "action_compare_products"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(response="utter_compare")

        message = "To compare products, you can:\n\n1. Search for products in the same category\n2. Ask about prices: \"how much is rice?\"\n3. Compare features: \"what's the difference between Product A and Product B?\"\n\n---\n\nFɔ kɔmpia prɔdak, yu kin:\n\n1. Sach fɔ prɔdak na sem kategɔri\n2. Aks bɔt prais: \"ɔmɔs fɔ rais?\"\n3. Kɔmpia ficha: \"wetin na di difrɛns bitwi Prɔdak A ɛn Prɔdak B?\""

        dispatcher.utter_message(text=message)
        return []


class ActionGetRecommendations(Action):
    """Get product recommendations"""

    def name(self) -> Text:
        return "action_get_recommendations"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()
            # Get top 5 popular products
            cursor.execute("""
                SELECT p.name, p.price, p.category, u.name as merchant_name
                FROM products p
                LEFT JOIN users u ON p.merchant_id = u.id
                WHERE p.is_active = true
                ORDER BY p.created_at DESC
                LIMIT 5
            """)

            products = cursor.fetchall()

            if products:
                message = "⭐ **Popular Products / Popula Prɔdak**\n\n"

                for idx, product in enumerate(products, 1):
                    name, price, category, merchant_name = product
                    message += f"{idx}. **{name}** - Le {price:,.0f}\n"
                    message += f"   Category: {category or 'General'} | {merchant_name}\n\n"

                message += "\nTo order any of these, say: 'I want to order [product name]'\n"
                message += "Fɔ ɔda, se: 'A want ɔda [prɔdak nem]'"

                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="No recommendations available at the moment.\n\nNɔ rikɔmɛndɛshɔn de naw.")

        except Exception as e:
            print(f"[RASA Actions] Error getting recommendations: {e}")
            dispatcher.utter_message(text="Error retrieving recommendations.")
        finally:
            if conn:
                conn.close()

        return []


class ActionSearchByBudget(Action):
    """Search for products within a budget"""

    def name(self) -> Text:
        return "action_search_by_budget"

    def _extract_budget(self, message: str) -> int:
        """Extract budget amount from message"""
        import re

        # Patterns to find amounts (Le 100, 100 Le, 100 leones, etc.)
        patterns = [
            r'le\s*(\d+(?:,\d{3})*)',  # Le 100, Le 1,000
            r'(\d+(?:,\d{3})*)\s*le',  # 100 Le, 1,000 Le
            r'(\d+(?:,\d{3})*)\s*leones?',  # 100 leones
            r'with\s+(\d+(?:,\d{3})*)',  # with 100
            r'wit\s+(\d+(?:,\d{3})*)',  # wit 100 (Krio)
            r'fɔ\s+(\d+(?:,\d{3})*)',  # fɔ 100 (Krio)
        ]

        message_lower = message.lower().strip()

        for pattern in patterns:
            match = re.search(pattern, message_lower, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    return int(amount_str)
                except ValueError:
                    continue

        return None

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_message = tracker.latest_message.get('text', '')
        budget = self._extract_budget(user_message)

        if not budget:
            dispatcher.utter_message(text="How much do you want to spend? For example: 'What can I buy with Le 500?'\n\nƆmɔs yu want spɛnd? Fɔ ɛgzampul: 'Wetin a kin bay wit Le 500?'")
            return []

        conn = get_db_connection()
        if not conn:
            dispatcher.utter_message(text="Sorry, database connection issue.")
            return []

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.name, p.price, p.description, p.category,
                       u.name as merchant_name
                FROM products p
                LEFT JOIN users u ON p.merchant_id = u.id
                WHERE p.price <= %s AND p.is_active = true
                ORDER BY p.price DESC
                LIMIT 10
            """, (budget,))

            products = cursor.fetchall()

            if products:
                message_parts = [f"💰 **Products under Le {budget:,} / Prɔdak ɔnda Le {budget:,}**\n"]

                for idx, product in enumerate(products, 1):
                    product_id, name, price, description, category, merchant_name = product
                    product_info = f"{idx}. **{name}**\n   💵 Le {price:,.0f}\n   🏪 {merchant_name}"
                    message_parts.append(product_info)

                message_parts.append("\nTo order, say: 'I want to order [product name]'\nFɔ ɔda, se: 'A want ɔda [prɔdak nem]'")
                message = "\n\n".join(message_parts)

                dispatcher.utter_message(text=message)
            else:
                message = f"❌ No products found under Le {budget:,}.\n\nTry a higher budget or browse our categories.\n\n---\n\nNɔ prɔdak fɔn ɔnda Le {budget:,}.\n\nTrai hay mɔni ɔ braws wi kategɔri dɛn."
                dispatcher.utter_message(text=message)

        except Exception as e:
            print(f"[RASA Actions] Error searching by budget: {e}")
            dispatcher.utter_message(text="Sorry, an error occurred.")
        finally:
            if conn:
                conn.close()

        return []


class ActionGreet(Action):
    """Custom greeting action that detects language and responds accordingly"""

    def name(self) -> Text:
        return "action_greet"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_message = tracker.latest_message.get('text', '').lower()

        # Krio greeting keywords
        krio_greetings = ['kushe', 'kushɛ', 'aw di bodi', 'aw yu de', 'wetin na yu nem', 'odi', 'kushe-o']

        # Check if user greeted in Krio
        is_krio = any(greeting in user_message for greeting in krio_greetings)

        if is_krio:
            # Respond in Krio only
            messages = [
                "Kushɛ! Wɛlkɔm to WeGo. Wetin a go ɛp yu wit tide? Yu kin sach fɔ prɔdak, chɛk yu oda, ɔ aks bɔt dilibri.",
                "Aw di bɔdi! A de ya fɔ ɛp yu wit oda, prɔdak, ɛn dilibri. Wetin yu nid?",
                "Wɛlkɔm to WeGo! Yu de luk fɔ sɔmtin? Trai se 'fɛn rais' ɔ 'sho mi fon dɛn'."
            ]
        else:
            # Respond in English only
            messages = [
                "Hello! Welcome to WeGo. How can I help you today? You can search for products, check your order, or ask about delivery.",
                "Hi there! I'm here to assist you with orders, products, and deliveries. What can I do for you?",
                "Welcome to WeGo! Looking for something specific? Try saying 'find rice' or 'show me phones'."
            ]

        # Pick a random greeting
        import random
        greeting = random.choice(messages)
        dispatcher.utter_message(text=greeting)

        return []


class ActionDefaultFallback(Action):
    """Default fallback action when intent is not recognized"""

    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(response="utter_default")
        return []
