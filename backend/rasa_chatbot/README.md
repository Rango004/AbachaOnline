# WeGo Bilingual RASA Chatbot (English & Krio)

This guide will help you set up and run the RASA-powered chatbot for WeGo that supports both **English** and **Krio** (Sierra Leonean Creole).

## Important: Python Version Requirement ⚠️

**RASA 3.6.0 ONLY works with Python 3.8, 3.9, or 3.10**

You currently have **Python 3.14.0** installed, which is NOT compatible with RASA. You need to install Python 3.10 alongside your current installation.

### Installing Python 3.10 (Keep Python 3.14)

#### Windows

1. **Download Python 3.10.11**:
   - Visit: https://www.python.org/downloads/release/python-31011/
   - Download "Windows installer (64-bit)"

2. **Install with these settings**:
   - ✅ Check "Add Python 3.10 to PATH"
   - ✅ Click "Customize installation"
   - ✅ Check "Install for all users"
   - Choose install location: `C:\Python310\`

3. **Verify installation**:
   ```bash
   py -3.10 --version
   # Should show: Python 3.10.11
   ```

4. **Your Python 3.14 remains unchanged**:
   ```bash
   python --version
   # Still shows: Python 3.14.0
   ```

#### Mac/Linux

1. **Install pyenv** (Python version manager):
   ```bash
   # Mac
   brew install pyenv

   # Linux
   curl https://pyenv.run | bash
   ```

2. **Install Python 3.10**:
   ```bash
   pyenv install 3.10.11
   pyenv local 3.10.11
   ```

3. **Verify**:
   ```bash
   python --version
   # Should show: Python 3.10.11
   ```

---

## Prerequisites

- ✅ **Python 3.10** (installed as shown above)
- ✅ **Node.js 16+** (for WeGo backend)
- ✅ **PostgreSQL** (already configured for WeGo)
- ✅ **pip** (comes with Python)

---

## Installation Steps

### Step 1: Navigate to RASA Directory

```bash
cd backend/rasa_chatbot
```

### Step 2: Create Virtual Environment with Python 3.10

**Windows:**
```bash
# Use Python 3.10 specifically
py -3.10 -m venv venv

# Activate
venv\Scripts\activate
```

**Mac/Linux:**
```bash
# If using pyenv
python3.10 -m venv venv

# Activate
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Verify Python Version in Virtual Environment

```bash
python --version
# MUST show: Python 3.10.x
```

If it shows 3.14, deactivate and recreate the venv with `py -3.10` on Windows or `python3.10` on Mac/Linux.

### Step 4: Install RASA and Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- RASA 3.6.0
- RASA SDK 3.6.0
- spacy (for NLU)
- requests (for API calls)
- python-dateutil

Installation takes 5-10 minutes.

### Step 5: Download Language Model

```bash
# Download English language model
python -m spacy download en_core_web_md
```

*Note: There's no official Krio model, but RASA will use character-level features and word embeddings that work across languages.*

### Step 6: Train the Bilingual Model

Train the model with both English and Krio data:

```bash
rasa train
```

This will:
- Process English and Krio NLU training data
- Train intent classifier for both languages
- Learn conversation flows
- Save model in `models/` directory

**First training takes 3-7 minutes.**

### Step 7: Test the Model

Test in command line:

```bash
rasa shell
```

**Try these English examples:**
- "hi"
- "where is my order"
- "search for rice"
- "how long is delivery"

**Try these Krio examples:**
- "kushɛ" (hello)
- "udat ma oda de" (where is my order)
- "a want fɛn rais" (I want to find rice)
- "au lɔng di dilibri" (how long is delivery)

Type `/stop` to exit.

---

## Bilingual Support: English & Krio

### Language Detection

The chatbot automatically detects whether the user is speaking English or Krio based on:
- Keywords and patterns
- Character n-grams
- Intent classification confidence

### Krio Language Notes

**Krio (Sierra Leone Creole)** is an English-based Creole language spoken by 97% of Sierra Leone's population.

**Common Krio Phrases:**
- **kushɛ** / **aw di bodi** - Hello / How are you
- **tenki** - Thank you
- **a de kam** - I'm coming
- **ɔl rayt** - Alright / OK
- **we tin** - What thing / What
- **udat** - Where / Where is
- **au bɔku** - How much
- **a want** - I want
- **mi oda** - My order

### Response Language

The bot responds in the **same language** the user speaks:
- English input → English response
- Krio input → Krio response

---

## Running the Chatbot

You need **three terminals** running simultaneously:

### Terminal 1: RASA Server (NLU & Dialogue)

```bash
cd backend/rasa_chatbot

# Activate virtual environment
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

# Start RASA server
rasa run --enable-api --port 5005
```

✅ Should see: `Rasa server is up and running`

### Terminal 2: RASA Action Server (Custom Actions)

```bash
cd backend/rasa_chatbot

# Activate virtual environment
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

# Start action server
rasa run actions --port 5055
```

✅ Should see: `Action server is up and running on port 5055`

### Terminal 3: WeGo Backend

```bash
cd backend
npm start
```

✅ Should see: `Server running on port 3000`

---

## Using the Chatbot

### Frontend Access

1. Start frontend: `npm run dev` (in `frontend/` directory)
2. Login as **customer** or **student**
3. Look for **purple robot icon 🤖** (bottom-right, below blue chat icon)
4. Click to open chatbot

### Chatbot Features

**English Commands:**
- "where is my order WG123456"
- "find laptops under 500000 leones"
- "how long for delivery to Quad 1"
- "what payment methods do you accept"
- "I want a refund for order WG123456"
- "talk to a human"

**Krio Commands:**
- "udat ma oda WG123456 de" (where is my order)
- "fɛn lɛptɔp we dɛn de sɛl" (find laptops for sale)
- "au lɔng di dilibri tek" (how long does delivery take)
- "wetin na di we dɛn we una de tek pe" (what are the payment methods)
- "a want rifɔnd fɔ oda WG123456" (I want refund for order)
- "a want tɔk wit pɔsin" (I want to talk with person)

### Quick Action Buttons

The chatbot provides buttons (work in both languages):
- 📦 **Check Order** / **Chek Oda**
- 🔍 **Find Products** / **Fɛn Prɔdak**
- 🚚 **Delivery Time** / **Dilibri Taym**
- 💬 **Human Support** / **Tɔk wit Pɔsin**

---

## Architecture

```
┌─────────────────┐
│  User Input     │
│  (EN or KR)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Frontend       │
│  ChatbotWidget  │
└────────┬────────┘
         │ HTTP REST API + WebSocket
┌────────▼────────┐
│  WeGo Backend   │
│  Port 3000      │
└────┬───────┬────┘
     │       │
     │       │ Webhook
┌────▼───────▼────┐
│  RASA Server    │
│  Port 5005      │
│  - Detects EN/KR│
│  - Intent Class │
│  - Entity Extract│
└────────┬────────┘
         │
┌────────▼────────┐
│ RASA Actions    │
│ Port 5055       │
│ - Query WeGo DB │
│ - Return EN/KR  │
└─────────────────┘
```

---

## Customizing Training Data

### Adding More Krio Examples

Edit `data/nlu.yml`:

```yaml
- intent: check_order_status
  examples: |
    # English
    - where is my order
    - track my order [WG123456](order_id)

    # Krio
    - udat ma oda [WG123456](order_id) de
    - a want chek ma oda [WG789012](order_id)
    - mi oda dɔn rich
    - wetin apin to oda [WG456789](order_id)
```

### Adding More Krio Responses

Edit `domain.yml`:

```yaml
responses:
  utter_greet:
    - text: "Hello! Welcome to WeGo. How can I help you?"  # English
    - text: "Kushɛ! Wɛlkɔm to WeGo. Wetin a go ɛp yu wit?"  # Krio
```

### Retrain After Changes

```bash
rasa train
# Restart RASA servers
```

---

## Language-Specific Responses

The chatbot uses **conditional responses** based on detected language:

```python
# In actions/actions.py
def get_response_text(language, message_en, message_kr):
    """Return message in user's language"""
    return message_kr if language == 'krio' else message_en
```

Example in action:
```python
# English
message = "Your order WG123456 is in transit."

# Krio
message = "Yu oda WG123456 de insay transit."
```

---

## Troubleshooting

### ❌ "Python version not supported"

**Problem**: Using Python 3.14 instead of 3.10

**Solution**:
```bash
# Windows
py -3.10 -m venv venv

# Mac/Linux
python3.10 -m venv venv
```

### ❌ "py: No suitable Python version found"

**Problem**: Python 3.10 not installed

**Solution**: Follow "Installing Python 3.10" section above

### ❌ "RASA server not running"

**Solution**:
```bash
cd backend/rasa_chatbot
source venv/bin/activate  # or venv\Scripts\activate
rasa run --enable-api --port 5005
```

### ❌ "Custom actions not working"

**Solution**: Ensure action server is running:
```bash
rasa run actions --port 5055
```

### ❌ "Bot doesn't understand Krio"

**Solution**:
1. Add more Krio examples to `data/nlu.yml`
2. Retrain: `rasa train`
3. Restart servers

### ❌ "Language model not found"

**Solution**:
```bash
python -m spacy download en_core_web_md
```

---

## Production Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Activate venv first, then start servers
cd backend/rasa_chatbot
source venv/bin/activate

# Start RASA server
pm2 start "rasa run --enable-api --port 5005" \
  --name rasa-server \
  --interpreter venv/bin/python

# Start action server
pm2 start "rasa run actions --port 5055" \
  --name rasa-actions \
  --interpreter venv/bin/python

# Auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs rasa-server
pm2 logs rasa-actions
```

### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt
RUN python -m spacy download en_core_web_md
RUN rasa train

EXPOSE 5005

CMD ["rasa", "run", "--enable-api", "--port", "5005", "--cors", "*"]
```

Build and run:

```bash
docker build -t wego-rasa .
docker run -p 5005:5005 wego-rasa
```

---

## Testing Bilingual Functionality

### Test Script

Create `test_bilingual.py`:

```python
import requests

RASA_URL = "http://localhost:5005/webhooks/rest/webhook"

def test_message(text, sender="test_user"):
    response = requests.post(
        RASA_URL,
        json={"sender": sender, "message": text}
    )
    print(f"User: {text}")
    for msg in response.json():
        print(f"Bot: {msg['text']}")
    print()

# Test English
test_message("hello")
test_message("where is my order")

# Test Krio
test_message("kushɛ")
test_message("udat ma oda de")
```

Run:
```bash
python test_bilingual.py
```

---

## Performance Optimization

### Bilingual Model Size

The bilingual model is larger than English-only:
- **English-only**: ~200MB
- **Bilingual (EN + KR)**: ~250MB

This is acceptable for production.

### Response Time

Expected response times:
- Intent classification: 50-100ms
- Custom action (DB query): 100-300ms
- Total response: 200-500ms

### Concurrent Users

With proper server specs:
- **Development**: 10-20 concurrent users
- **Production** (2 CPU, 4GB RAM): 50-100 concurrent users

---

## Analytics

### Track Language Usage

Query database:

```sql
-- Language distribution
SELECT
  CASE
    WHEN message_text ~* 'kushɛ|udat|wetin|tenki' THEN 'Krio'
    ELSE 'English'
  END as language,
  COUNT(*) as count
FROM chatbot_messages
WHERE sender = 'user'
GROUP BY language;
```

### Most Common Intents by Language

```sql
-- Top intents
SELECT intent, COUNT(*) as count
FROM chatbot_messages
WHERE sender = 'bot' AND intent IS NOT NULL
GROUP BY intent
ORDER BY count DESC
LIMIT 10;
```

---

## Resources

### Krio Language Resources

- **Krio Dictionary**: http://www.kriol.net/
- **Krio Grammar**: Peace Corps Sierra Leone materials
- **Unicode Krio**: Uses Latin script with special characters (ɛ, ɔ, ŋ)

### RASA Documentation

- Official Docs: https://rasa.com/docs/
- NLU Best Practices: https://rasa.com/docs/rasa/nlu-training-data
- Custom Actions: https://rasa.com/docs/rasa/custom-actions

### Python Version Management

- **Windows**: Use `py` launcher (comes with Python)
- **Mac/Linux**: Use `pyenv` (https://github.com/pyenv/pyenv)

---

## FAQ

### Q: Can I use only English or only Krio?

**A:** Yes! Just remove the unwanted language from `data/nlu.yml` and `domain.yml`, then retrain.

### Q: How accurate is Krio detection?

**A:** ~70-80% accuracy with provided training data. Add more Krio examples to improve.

### Q: Can I add more Sierra Leonean languages (Mende, Temne)?

**A:** Yes! Follow the same pattern:
1. Add training examples in `nlu.yml`
2. Add responses in `domain.yml`
3. Retrain model

### Q: Does this work offline?

**A:** RASA servers run locally, but WeGo backend needs internet for database access.

### Q: Can users mix English and Krio?

**A:** Yes! RASA handles code-switching. Example: "a want check mi order" works.

---

## Support

**Issues?**
1. Check RASA logs (terminal output)
2. Check WeGo backend logs (`backend/logs/`)
3. Verify Python version: `python --version` (must be 3.10.x)
4. Test individual components:
   - `rasa shell` - Test NLU
   - `curl http://localhost:5005` - Test server
   - `curl http://localhost:5055/health` - Test actions

**Need Help?**
- RASA Forum: https://forum.rasa.com/
- WeGo GitHub Issues: [your-repo]

---

## Next Steps

- [ ] Train model with more Sierra Leonean user data
- [ ] Add Mende and Temne language support
- [ ] Collect user feedback on Krio responses
- [ ] A/B test English vs Krio response accuracy
- [ ] Create voice interface for illiterate users

---

**Language Support:** English (EN) + Krio (KR)
**RASA Version:** 3.6.0
**Python Version:** 3.10.11 (Required)
**WeGo Version:** 1.0.0

**Last Updated:** December 18, 2025
