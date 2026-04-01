# Gaura AI Platform: Edge-Compute & Decentralized Architecture

## 1. Core Philosophy
- **Zero-Data Server**: The central hub is a "Thin Router" and Metadata Index. It stores no product details, only locations (which phone has what).
- **Edge Compute**: All heavy processing (AI vision, image generation, spec reporting) happens on the User/Seller device.
- **Privacy by Design**: Data lives and dies on the phone. It is shared only via "Relay" when a transaction or inquiry occurs.

## 2. The "Phone" (Mobile Node) Logic
- **Local DB**: SQLite storing full product catalogs, AI reports, and transaction history.
- **AI Processing (The "Gaura Brain")**:
  - **Vision**: Recognizes products from raw uploads.
  - **GenAI**: Creates stylized product images.
  - **Architect**: Generates detailed "Product Specification" reports.
- **Connectivity**: Maintains a secure socket/connection to the Central Hub for routing.

## 3. Central Hub (The Middleman)
- **Registry**: Maps UserIDs to their active Mobile Node addresses.
- **Discovery Index**: A minimal searchable index (Item Name, Category, NodeID).
- **Relay Engine**: Passes messages between Phone A and Phone B without inspecting the payload.

## 4. Key Features
- **AI Photo Gen**: Transform raw warehouse shots into premium listings locally.
- **Automated Specs**: AI writes the technical details so the seller doesn't have to.
- **Multi-Bot Factory**: One central service managing $N$ unique Telegram identities.

## 5. Technical Stack
- **AI**: Google Gemini (Vision + Text) via on-device API calls.
- **Backend**: FastAPI (Hub) + Local Python Service (Phone Stub).
- **Database**: Supabase (Registry) + SQLite (Phone).
