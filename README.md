# Shipper

Postage calculation API for Dogebox pre-orders

### Setup

Requires NodeJS 18 or upwards OR docker.

Copy the example configuration file and modify it for your environment:

```bash
cp config/config.example.json config/config.development.json
```

Edit `config/config.development.json` with your settings (All prices should be in DOGE):

```json
{
  "auspost": {
    "baseURL": "https://api.auspost.com.au"
  },
  "dogeToAudRate": 0.15,
  "handlingCost": 30,
  "originPostcode": "3333",
  "editions": {
    "standard": {
      "price": 3699,
      "name": "Standard Edition",
      "dimensions": { "length": 15, "width": 15, "height": 15 },
      "weight": 0.7
    },
    "founders": {
      "price": 6999,
      "name": "Founders Edition",
      "dimensions": { "length": 20, "width": 20, "height": 20 },
      "weight": 1.0
    },
    "b0rk": {
      "price": 9001,
      "name": "Full B0rk Edition",
      "dimensions": { "length": 25, "width": 25, "height": 25 },
      "weight": 1.2
    }
  },
  "fixedDomesticServices": {
    "standard": [
      { "name": "Regular", "price": 50 },
      { "name": "Express", "price": 60 }
    ],
    "founders": [
      { "name": "Regular", "price": 55 },
      { "name": "Express", "price": 75 }
    ],
    "b0rk": [
      { "name": "Regular", "price": 65 },
      { "name": "Express", "price": 90 }
    ]
  },
  "deliveryAdvice": {
    "domestic": "https://auspost.com.au/business/shipping/delivery-speeds-and-coverage",
    "international": "https://auspost.com.au/sending/delivery-speeds-and-coverage/international-delivery-times"
  }
}

```

Define your AusPost API key in AUSPOST_API_KEY
Define your Port in PORT

The application supports different environments through configuration files:

- `config/config.development.json` - Used when CONFIG_ENV=development or not set
- `config/config.production.json` - Used when CONFIG_ENV=production
- `config/config.test.json` - Used when CONFIG_ENV=testa

When deploying, set NODE_ENV to production

### Running in Prod (via Docker container)

```bash
# Build the container
docker build -t shipper .

# Run the container (mount config directory)
docker run -p 3000:3000 -v $(pwd)/config:/app/config shipper

# Interact with container
http <address>:3000/shipping/calc sku=b0rk country=PT
```

### Run in Prod (bare metal)

```bash
# Install NodeJS 18 or upwards
nvm install 18

# Install project dependencies
npm install

# Compile application (Typescript -> Javascript)
npm run build

# Run app
npm start
```

### Run dev server (not suitable for prod)

```bash
# Requires NodeJS 18 or greater
npm install
npm run dev
```

---

### Interacting with API

#### On success:

_Example HTTPie Request_
```bash
http localhost:3000/shipping/calc sku="b0rk" country="PT" postcode="90210"
```

_Example JSON Payload_
```json
{
    "sku": "b0rk",
    "country": "PT", 
    "postcode": "90210"
}
```

_Response_
```json
{
  "deliveryAdviceURL": "https://auspost.com.au/sending/delivery-speeds-and-coverage/international-delivery-times",
  "options": [
    {
      "id": "INT_PARCEL_COR_OWN_PACKAGING",
      "label": "Courier",
      "price": "134.15"
    },
    {
      "id": "INT_PARCEL_EXP_OWN_PACKAGING",
      "label": "Express",
      "price": "69.15"
    },
    {
      "id": "INT_PARCEL_STD_OWN_PACKAGING",
      "label": "Standard",
      "price": "54.15"
    },
    {
      "id": "INT_PARCEL_AIR_OWN_PACKAGING",
      "label": "Economy Air",
      "price": "51.65"
    }
  ],
  "success": true
}
```

#### On error:

_Bad Example HTTPie Request_
```bash
http localhost:3000/shipping/calc sku="bL0rk" country="CHICKEN" postcode="90210"
```

_Bad Example JSON Payload_
```json
{
    "sku": "bL0rk",
    "country": "CHICKEN", 
    "postcode": "90210"
}
```

_Response:_
```json
{
  "error": "BAD_INPUT",
  "reasons": [
    "Invalid SKU. Received \"bL0rk\", expected one of standard, founders, b0rk",
    "Malformed country code. Received \"CHICKEN\", expected 2 letter A-Z"
  ],
  "success": false
}
```
