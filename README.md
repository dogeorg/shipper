# Shipper

Postage calculation API for Dogebox pre-orders

### Setup

Requires NodeJS 18 or upwards OR docker.

Create a .env file with the following contents:
```
AUSPOST_API_KEY=your-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Running in Prod (via Docker container)

```
# Build the container
docker build -t shipper .

# Run the container
docker run -p 3000:3000 --env-file .env shipper

# Interact with container
http <address>:3000/shipping/calc sku=b0rk country=PT
```

### Run in Prod (bare metal)

```
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

```
# Requires NodeJS 18 or greater
npm install
npm run dev
```

---


### Interacting with API

#### On success:

*Request*

```
http localhost:3000/shipping/calc sku="b0rk" country="PT" postcode="90210"
```

*Response*

```
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

*Example bad request:*

```
http localhost:3000/shipping/calc sku="bL0rk" country="CHICKEN" postcode="90210"
```

*Response:*

```
{
  "error": "BAD_INPUT",
  "reasons": [
      "Invalid SKU. Received \"bL0rk\", expected one of standard, founders, b0rk",
      "Malformed country code. Received \"CHICKEN\", expected 2 letter A-Z"
  ],
  "success": false
}
```
