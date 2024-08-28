# Shipper

Postage calculation API for Dogebox pre-orders

### Installation

```
npm install
```

### Setup

Create a .env file with the following contents:
```
AUSPOST_API_KEY=<OBTAIN A KEY>
```

### Run locally

```
npm run dev
```

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