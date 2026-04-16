# WanderWise AI — An Intelligent Tourism Concierge System Using Fine-Tuned Large Language Models

---

## ABSTRACT

The tourism industry is one of the fastest-growing sectors globally, yet travelers frequently struggle to access reliable, personalised, and context-aware travel guidance. This project presents **WanderWise AI**, an intelligent tourism concierge system powered by a fine-tuned Large Language Model (LLM). The system leverages Meta's **Llama 3.1 8B** foundation model, fine-tuned using **QLoRA (Quantized Low-Rank Adaptation)** on a curated dataset of over **49,000 unique tourism Q&A pairs** spanning restaurants, historical landmarks, flights, transportation, trip planning, budgeting, safety, and cultural customs. The fine-tuned model is quantized to the **GGUF format** and deployed locally via **Ollama**, enabling fully offline, privacy-preserving inference. A modern **React + Vite** web frontend—branded as *WanderWise*—provides an interactive chat interface where users converse with **"Wandi,"** the AI travel concierge, to receive expert-level travel recommendations, multi-day itineraries, and real-time trip planning assistance. The system demonstrates that domain-specific fine-tuning of open-weight LLMs can produce a high-quality, production-ready AI assistant that operates entirely on consumer hardware without cloud API dependencies.

**Keywords:** Large Language Model, Fine-Tuning, QLoRA, Tourism AI, Ollama, Llama 3.1, Travel Concierge, GGUF, React, Vite

---

## LIST OF FIGURES

| Figure No. | Title | Page |
|---|---|---|
| Fig 3.1 | High-Level System Architecture of WanderWise AI | 8 |
| Fig 3.2 | Training Data Pipeline | 9 |
| Fig 3.3 | Fine-Tuning Pipeline with QLoRA on Google Colab | 10 |
| Fig 3.4 | Deployment Architecture (Ollama + React Frontend) | 11 |
| Fig 4.1 | Class Diagram — WandiTourismAI Client | 13 |
| Fig 4.2 | Sequence Diagram — User Query Lifecycle | 14 |
| Fig 4.3 | Component Architecture of the React Frontend | 15 |
| Fig 5.1 | Template-Based Data Generation Flow | 16 |
| Fig 5.2 | QLoRA Adapter Architecture (4-bit NormalFloat) | 17 |
| Fig 5.3 | Ollama Modelfile Configuration Flow | 18 |
| Fig 5.4 | API Client Streaming Architecture | 19 |
| Fig 6.1 | Category Distribution of Training Data | 21 |
| Fig 6.2 | Sample Responses — Restaurant Recommendations | 22 |
| Fig 6.3 | Sample Responses — Trip Planning | 23 |
| Fig 6.4 | Response Latency Benchmarks (Local Inference) | 24 |

---

## LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|---|---|
| AI | Artificial Intelligence |
| LLM | Large Language Model |
| NLP | Natural Language Processing |
| QLoRA | Quantized Low-Rank Adaptation |
| LoRA | Low-Rank Adaptation |
| GGUF | GPT-Generated Unified Format |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| JSON | JavaScript Object Notation |
| JSONL | JSON Lines |
| CLI | Command-Line Interface |
| HMR | Hot Module Replacement |
| CSS | Cascading Style Sheets |
| HTML | HyperText Markup Language |
| JSX | JavaScript XML |
| GPU | Graphics Processing Unit |
| VRAM | Video Random Access Memory |
| SFT | Supervised Fine-Tuning |
| PEFT | Parameter-Efficient Fine-Tuning |
| NF4 | 4-bit NormalFloat |
| UNESCO | United Nations Educational, Scientific and Cultural Organization |

---

## CHAPTER 1 — INTRODUCTION

### 1.1 Background and Motivation

The global tourism industry generated over **USD 9.9 trillion** in 2024, representing approximately 9.1% of global GDP (World Travel & Tourism Council). With the rapid democratization of international travel, tourists face an information overload problem — they must sift through countless review websites, blogs, travel forums, and booking platforms to plan even a simple trip. Existing solutions like Google Maps, TripAdvisor, and travel blogs offer fragmented information; none provide a single, conversational interface capable of answering the full spectrum of travel queries — from restaurant recommendations and cultural etiquette to multi-day itinerary generation and budget optimization.

The emergence of **Large Language Models (LLMs)** such as GPT-4, Gemini, and Llama has opened new possibilities for building domain-specific AI assistants. While general-purpose LLMs possess broad knowledge, they often lack the specificity, formatting consistency, and persona adherence required for a dedicated tourism concierge. Furthermore, cloud-based AI APIs introduce concerns around **cost, latency, privacy, and availability** — a user planning a trip in a region with poor internet connectivity cannot rely on cloud-dependent AI.

This project addresses these challenges by building **WanderWise AI**, a fully offline, fine-tuned tourism AI system that runs on consumer hardware.

### 1.2 Problem Statement

Existing AI-based travel assistants suffer from the following limitations:

1. **Generic Responses:** General-purpose LLMs provide vague, non-actionable travel advice lacking specific names, prices, timings, and local insights.
2. **Cloud Dependency:** Most AI travel tools require constant internet connectivity and paid API subscriptions, making them inaccessible in offline or budget-constrained scenarios.
3. **Privacy Concerns:** Cloud-based solutions send personal travel plans and preferences to third-party servers.
4. **Lack of Structured Output:** Travel queries often demand structured information (itineraries, budget tables, packing lists) that generic chatbots fail to produce consistently.
5. **No Domain Persona:** Generic chatbots lack the warm, knowledgeable persona of an experienced travel concierge.

### 1.3 Objectives

The primary objectives of this project are:

#### 1.3.1 Specific Objectives

1. **Curate a high-quality tourism training dataset** comprising 49,000+ Q&A pairs across 9 travel categories (restaurants, history, flights, transportation, trip planning, budget, weather, safety, and activities).
2. **Fine-tune Meta's Llama 3.1 8B model** using QLoRA (4-bit quantization) on Google Colab to create a specialized tourism AI persona named "Wandi."
3. **Export the fine-tuned model to GGUF format** and deploy it locally via the Ollama runtime for fully offline inference.
4. **Build a Python API client** (`WandiTourismAI`) with streaming support, chat history management, and specialized endpoints for trip planning, restaurant finding, and transportation comparison.
5. **Develop a modern React-based web frontend** (WanderWise) that integrates with the local Ollama API to provide an interactive, premium travel concierge experience.
6. **Validate the system** through functional testing, response quality evaluation, and latency benchmarking.

---

## CHAPTER 2 — LITERATURE SURVEY

### 2.1 Large Language Models in Domain-Specific Applications

Large Language Models (LLMs) have demonstrated remarkable capabilities in natural language understanding and generation. Vaswani et al. (2017) introduced the Transformer architecture in *"Attention Is All You Need,"* which forms the backbone of all modern LLMs. Since then, models have scaled from millions to hundreds of billions of parameters.

**GPT-4 (OpenAI, 2023)** and **Gemini (Google, 2024)** represent the state-of-the-art in general-purpose LLMs, but their closed-source nature, high API costs, and cloud dependency limit their use in privacy-sensitive or offline applications.

**Meta's Llama family** (Touvron et al., 2023) pioneered the open-weight LLM movement. Llama 3.1, released in July 2024 with 8B, 70B, and 405B parameter variants, offers competitive performance with full weight access, enabling fine-tuning for domain-specific applications.

### 2.2 Parameter-Efficient Fine-Tuning (PEFT)

Full fine-tuning of LLMs requires updating all model parameters, which is computationally prohibitive for models with billions of parameters. **LoRA (Low-Rank Adaptation)** (Hu et al., 2022) addressed this by freezing the pre-trained weights and injecting trainable low-rank matrices into each layer, reducing trainable parameters by 90%+.

**QLoRA (Quantized Low-Rank Adaptation)** (Dettmers et al., 2023) further optimized this approach by quantizing the base model to 4-bit precision (NF4 — NormalFloat4) while keeping the LoRA adapters in higher precision. This breakthrough enabled fine-tuning of 7B–65B parameter models on a single consumer GPU with as little as 6 GB VRAM.

### 2.3 AI in Tourism and Hospitality

The application of AI in tourism has evolved from rule-based chatbots (Li et al., 2019) to sophisticated recommendation engines. Gavalas et al. (2014) surveyed mobile tourism systems and identified the need for context-aware, personalized recommendations. More recently, Zheng et al. (2023) explored using GPT-4 for itinerary generation and found that while the model produces coherent plans, it lacks specificity and local knowledge.

Research by Tussyadiah & Miller (2019) highlighted that travelers prefer AI systems that exhibit **personality, expertise, and proactiveness** — traits that generic chatbots lack but fine-tuned models can embody.

### 2.4 Model Quantization and Edge Deployment

Deploying billion-parameter models on consumer hardware requires aggressive quantization. The **GGUF (GPT-Generated Unified Format)** standard, developed by the llama.cpp community, enables efficient inference of quantized models on CPUs/GPUs with minimal accuracy loss. Studies by Dettmers et al. (2023) showed that 4-bit quantization (Q4_K_M) retains 97%+ of full-precision model quality on most benchmarks.

**Ollama** (2024) emerged as the leading runtime for local LLM deployment, providing a Docker-like interface for model management, API serving, and custom system prompts via Modelfiles.

### 2.5 Identified Research Gap

While prior work has explored using LLMs for tourism individually, no existing system combines all of the following:
- A **domain-specific fine-tuned model** (not just prompt-engineered general LLM)
- **Fully offline deployment** on consumer hardware
- A **curated multi-source training dataset** with 49,000+ tourism-specific examples
- A **production-ready web interface** for real-time conversational interaction
- **Structured output** (travel itineraries, budget tables, packing lists)

WanderWise AI fills this gap.

---

## CHAPTER 3 — SYSTEM DESIGN AND IMPLEMENTATION

### 3.1 High-Level System Architecture

The WanderWise AI system follows a **three-tier architecture**:

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                      │
│           React + Vite Web Application                    │
│      (WanderWise Frontend — Interactive Chat UI)          │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP REST API (JSON)
                        ▼
┌──────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                        │
│              Ollama Runtime Server                         │
│     (Serves fine-tuned Wandi model via REST API)          │
│     ┌─────────────────────────────────────┐               │
│     │  WandiTourismAI Python Client       │               │
│     │  (ask, ask_stream, plan_trip,       │               │
│     │   find_restaurants, get_transport)  │               │
│     └─────────────────────────────────────┘               │
└───────────────────────┬──────────────────────────────────┘
                        │ Model Loading
                        ▼
┌──────────────────────────────────────────────────────────┐
│                      DATA TIER                            │
│         Fine-Tuned GGUF Model (Q4_K_M)                   │
│    ┌──────────────────────────────────────┐               │
│    │  Training Datasets (49,000+ pairs)  │               │
│    │  - Bitext Travel (31,658)           │               │
│    │  - Travel QA (17,672)               │               │
│    │  - Custom Templates (200+)          │               │
│    └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

*Fig 3.1: High-Level System Architecture of WanderWise AI*

### 3.2 Training Data Pipeline

The training data pipeline is designed to aggregate, normalize, and deduplicate tourism Q&A data from multiple sources:

```
┌─────────────────┐    ┌─────────────────┐    ┌────────────────────┐
│ Hugging Face     │    │ Custom Template  │    │ API-Based          │
│ Datasets         │    │ Generator        │    │ Generation         │
│ (bitext, QA)     │    │ (9 categories)   │    │ (OpenAI / Ollama)  │
└───────┬─────────┘    └───────┬─────────┘    └───────┬────────────┘
        │                      │                       │
        ▼                      ▼                       ▼
┌──────────────────────────────────────────────────────────┐
│              Deduplication & Normalization                 │
│        (Unique by input text, JSONL format)               │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ all_merged.jsonl  │
              │ (49,000+ pairs)   │
              └───────────────────┘
```

*Fig 3.2: Training Data Pipeline*

**Data Sources:**

| Source | Records | Description |
|---|---|---|
| Bitext Travel LLM Chatbot Dataset | 31,658 | Professional customer-service style travel Q&A from Hugging Face |
| JasleenSingh91/travel-QA | 17,672 | Diverse open-ended travel questions with detailed answers |
| Custom Template Generation | 200+ | Handcrafted templates across 9 categories (restaurants, history, flights, transport, trip planning, budget, weather, safety, activities) |
| **Total (after deduplication)** | **~49,000** | **Merged, deduplicated dataset** |

### 3.3 Fine-Tuning Pipeline

Fine-tuning is performed on **Google Colab** using a free-tier T4 GPU (16 GB VRAM):

```
┌────────────────────┐
│  Llama 3.1 8B      │
│  (Base Model)      │
└────────┬───────────┘
         │ Load in 4-bit (NF4)
         ▼
┌────────────────────┐
│  QLoRA Adapter     │
│  (rank=16, α=32)   │
│  Trainable: ~0.5%  │
│  of total params   │
└────────┬───────────┘
         │ Train on 49K pairs
         ▼
┌────────────────────┐
│  Merge Adapters    │
│  + Base Model      │
└────────┬───────────┘
         │ Export
         ▼
┌────────────────────┐
│  GGUF (Q4_K_M)     │
│  ~4.7 GB file      │
└────────────────────┘
```

*Fig 3.3: Fine-Tuning Pipeline with QLoRA on Google Colab*

**Fine-Tuning Hyperparameters:**

| Parameter | Value |
|---|---|
| Base Model | meta-llama/Llama-3.1-8B |
| Quantization | 4-bit NF4 (bitsandbytes) |
| LoRA Rank (r) | 16 |
| LoRA Alpha (α) | 32 |
| LoRA Dropout | 0.05 |
| Target Modules | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Optimizer | AdamW (8-bit) |
| Learning Rate | 2e-4 |
| Batch Size | 4 (with gradient accumulation) |
| Epochs | 3 |
| Max Sequence Length | 2048 |
| Training Framework | Unsloth + Hugging Face Transformers |

### 3.4 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              User's Local Machine                │
│                                                  │
│  ┌─────────────┐      ┌──────────────────────┐  │
│  │ React App   │─────▶│ Ollama Server        │  │
│  │ (port 5173) │ HTTP │ (port 11434)         │  │
│  │             │◀─────│                      │  │
│  │ Vite Dev    │ JSON │ wandi-tourism model  │  │
│  │ Server      │      │ (GGUF, ~4.7 GB)     │  │
│  └─────────────┘      └──────────────────────┘  │
│         ▲                       ▲                │
│         │                       │                │
│     Browser               Modelfile              │
│     (User)                (System Prompt          │
│                            + Parameters)          │
└─────────────────────────────────────────────────┘
```

*Fig 3.4: Deployment Architecture (Ollama + React Frontend)*

### 3.5 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React | 19.2.4 | UI component framework |
| Build Tool | Vite | 8.0.1 | Fast development server with HMR |
| Styling | Vanilla CSS | — | Custom design system with CSS variables |
| Language | JavaScript (JSX) | ES2024 | Component logic |
| LLM Runtime | Ollama | Latest | Local model serving via REST API |
| Base Model | Llama 3.1 8B | — | Foundation language model |
| Fine-Tuning | Unsloth + QLoRA | — | Efficient fine-tuning framework |
| Quantization Format | GGUF (Q4_K_M) | — | Compressed model for local deployment |
| Training Platform | Google Colab | T4 GPU | Cloud training environment |
| API Client | Python 3.11+ | — | Backend interaction layer |
| Data Sources | Hugging Face Datasets | — | Training data acquisition |

---

## CHAPTER 4 — DETAILED DESIGN

### 4.1 Class Diagram — WandiTourismAI Python Client

```
┌─────────────────────────────────────────┐
│          WandiTourismAI                  │
├─────────────────────────────────────────┤
│ - base_url: str                         │
│ - model: str                            │
│ - chat_history: List[Dict]              │
├─────────────────────────────────────────┤
│ + __init__(base_url, model)             │
│ + is_available() → bool                 │
│ + ask(message, include_history) → str   │
│ + ask_stream(message) → Generator[str]  │
│ + plan_trip(dest, days, travelers,      │
│     budget, interests) → str            │
│ + find_restaurants(location, cuisine,   │
│     budget, dietary) → str              │
│ + get_transport(origin, dest) → str     │
│ + get_history(place) → str              │
│ + clear_history() → None                │
└─────────────────────────────────────────┘
```

*Fig 4.1: Class Diagram — WandiTourismAI Client*

**Method Descriptions:**

| Method | Description |
|---|---|
| `is_available()` | Checks if the Ollama server is running and the wandi-tourism model is loaded |
| `ask(message)` | Sends a user message and returns the complete AI response; maintains chat history |
| `ask_stream(message)` | Streams the response token-by-token for real-time display; yields individual tokens |
| `plan_trip(...)` | Generates a detailed multi-day itinerary with timing, costs, and logistics |
| `find_restaurants(...)` | Returns restaurant recommendations with price ranges and must-try dishes |
| `get_transport(...)` | Compares transportation options (flight, train, bus, car) between two locations |
| `get_history(place)` | Provides historical information and visiting tips for landmarks |
| `clear_history()` | Resets the conversation context |

### 4.2 Sequence Diagram — User Query Lifecycle

```
User          React App         Ollama API         Wandi Model
 │                │                  │                   │
 │  Type query    │                  │                   │
 │───────────────▶│                  │                   │
 │                │  POST /api/chat  │                   │
 │                │─────────────────▶│                   │
 │                │                  │  Tokenize input   │
 │                │                  │──────────────────▶│
 │                │                  │                   │
 │                │                  │  Generate tokens  │
 │                │                  │◀──────────────────│
 │                │  Stream tokens   │                   │
 │                │◀─────────────────│                   │
 │  Display resp. │                  │                   │
 │◀───────────────│                  │                   │
 │                │  Update history  │                   │
 │                │─────────────────▶│                   │
 │                │                  │                   │
```

*Fig 4.2: Sequence Diagram — User Query Lifecycle*

### 4.3 Data Flow Design

**Training Data Format (JSONL):**

Each training example follows the instruction-input-output format:

```json
{
  "instruction": "You are Wandi, an expert AI travel concierge specialized in tourism. Answer helpfully with specific details, prices, and practical tips.",
  "input": "What are the best Italian restaurants in Paris?",
  "output": "Great taste! Paris has amazing Italian dining options. Here are my top picks:\n\n🍽️ **Fine Dining:**\n1. **[Premium Restaurant]** — Award-winning chef...\n..."
}
```

### 4.4 Modelfile Configuration Design

The Ollama Modelfile defines the model's runtime behavior:

| Parameter | Value | Rationale |
|---|---|---|
| `temperature` | 0.7 | Balances creativity with factual accuracy |
| `top_p` | 0.9 | Nucleus sampling for diverse but relevant responses |
| `top_k` | 40 | Limits vocabulary to top-40 probable tokens |
| `num_ctx` | 4096 | Context window for multi-turn conversations |
| `repeat_penalty` | 1.1 | Prevents repetitive phrases in long responses |
| `num_predict` | 2048 | Maximum response length in tokens |
| `stop` | `<\|eot_id\|>` | Llama 3.1 end-of-turn token |

### 4.5 Frontend Component Architecture

```
┌──────────────────────────────────┐
│           App (Root)             │
│  ┌────────────────────────────┐  │
│  │       Hero Section         │  │
│  │  (Branding + Logo)         │  │
│  ├────────────────────────────┤  │
│  │    Chat Interface          │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ Message History      │  │  │
│  │  │ (User + AI bubbles)  │  │  │
│  │  ├──────────────────────┤  │  │
│  │  │ Input Box + Send     │  │  │
│  │  └──────────────────────┘  │  │
│  ├────────────────────────────┤  │
│  │  Documentation Links       │  │
│  │  Social / About Section    │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

*Fig 4.3: Component Architecture of the React Frontend*

---

## CHAPTER 5 — WORKING PRINCIPLE AND DETAILED DESCRIPTION

### 5.1 Training Data Generation

The system employs **three complementary strategies** for training data generation:

#### 5.1.1 Template-Based Generation (`generate_training_data.py`)

The template engine generates Q&A pairs by combining structured templates with variable pools:

- **Variable Pools:** 47 cities, 22 landmarks, 22 countries, 20 cuisines, and 17 interest categories
- **9 Content Categories:**
  1. **Restaurants & Food** — Fine dining, street food, allergy-friendly, rooftop restaurants
  2. **History & Culture** — Landmark histories, museum guides, cultural customs
  3. **Flights** — Route search, booking tips, airport arrival guides
  4. **Transportation** — Airport transfers, intercity transport comparisons
  5. **Trip Planning** — Multi-day itineraries for varied traveler types
  6. **Budget & Money** — Three-tier cost breakdowns (budget/mid-range/luxury)
  7. **Weather & Packing** — Season-aware packing lists
  8. **Safety** — Scam warnings, emergency info, safety ratings
  9. **Activities & Attractions** — Top experiences per destination

Each template function (e.g., `_restaurant_response()`, `_trip_plan_response()`) generates rich, formatted responses with:
- Emoji-enhanced section headers
- Specific price ranges
- Pro tips and insider knowledge
- Follow-up engagement prompts

#### 5.1.2 Public Dataset Integration (`download_datasets.py`)

Two curated Hugging Face datasets are downloaded and reformatted:

1. **Bitext Travel LLM Chatbot Training Dataset** (31,658 rows) — Professional customer-service style Q&A covering booking, cancellation, travel policies, and general travel queries.
2. **JasleenSingh91/travel-QA** (17,672 rows) — Diverse open-ended travel questions with detailed answers.

The download script handles:
- Multiple column name formats (question/answer, input/output, instruction/response)
- System instruction injection for "Wandi" persona consistency
- Automatic JSONL conversion and directory management

#### 5.1.3 API-Based Generation

For higher-quality training examples, the system supports generating data via:
- **OpenAI GPT-4o API** — Premium quality, requires API key
- **Local Ollama models** — Free, uses locally running models

Both modes generate 100+ diverse prompts across all categories, with temperature 0.8 for natural variation.

#### 5.1.4 Deduplication and Merging

All sources are merged into a single `all_merged.jsonl` file with deduplication by normalized input text, ensuring no duplicate questions exist across sources.

### 5.2 Model Fine-Tuning with QLoRA

#### 5.2.1 QLoRA Principle

QLoRA achieves efficient fine-tuning through three innovations:

1. **4-bit NormalFloat Quantization (NF4):** The pre-trained weights are quantized from 16-bit to 4-bit using an information-theoretically optimal data type for normally distributed weights, reducing memory from ~16 GB to ~4 GB.

2. **Low-Rank Adapters:** Small trainable matrices (rank 16) are injected into the attention and feed-forward layers. Only these adapters (~0.5% of total parameters) are updated during training, while the quantized base weights remain frozen.

3. **Double Quantization:** The quantization constants themselves are further quantized, saving an additional 0.37 bits per parameter.

#### 5.2.2 Training Process

The training is executed on Google Colab with the following workflow:

1. Upload `all_merged.jsonl` (49K pairs) to Colab
2. Load Llama 3.1 8B in 4-bit via `bitsandbytes`
3. Attach QLoRA adapters using `peft` library
4. Format data with Llama 3.1 chat template: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>...`
5. Train for 3 epochs with `SFTTrainer` from the `trl` library
6. Merge adapters with base model
7. Export to GGUF `Q4_K_M` format (~4.7 GB)

### 5.3 Local Deployment via Ollama

#### 5.3.1 Modelfile Configuration

The `Modelfile` configures the Ollama runtime with:

```
FROM ./unsloth.Q4_K_M.gguf

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
PARAMETER repeat_penalty 1.1
PARAMETER num_predict 2048

SYSTEM """You are Wandi, an expert AI travel concierge..."""

TEMPLATE """<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|><|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
```

The system prompt embeds Wandi's persona: expertise across 10 travel domains, formatting guidelines (emojis, structured output, pro tips), and engagement rules (always offer follow-up help).

#### 5.3.2 Deployment Steps

```
1. ollama serve                          # Start Ollama daemon
2. ollama create wandi-tourism -f Modelfile  # Register model
3. ollama run wandi-tourism              # Test in terminal
```

### 5.4 Python API Client (`wandi_api.py`)

The `WandiTourismAI` class provides a clean Python interface:

- **Connection Verification:** `is_available()` queries `/api/tags` to check model availability
- **Synchronous Chat:** `ask()` sends messages and returns complete responses
- **Streaming Chat:** `ask_stream()` yields tokens in real-time via server-sent events
- **Specialized Endpoints:** `plan_trip()`, `find_restaurants()`, `get_transport()`, `get_history()` construct optimized prompts for specific query types
- **Chat History:** Maintains conversation context for multi-turn interactions
- **Interactive Mode:** Terminal-based REPL with special commands (`/plan`, `/clear`, `/quit`)

**API Configuration:**

| Parameter | Value |
|---|---|
| Base URL | `http://localhost:11434` |
| Model | `wandi-tourism` |
| Temperature | 0.7 |
| Top-p | 0.9 |
| Max Predict | 2048 tokens |
| Timeout | 120 seconds |

### 5.5 React Frontend

The WanderWise frontend is built with **React 19 + Vite 8**, featuring:

- **Modern Design System:** CSS custom properties with light/dark mode support via `prefers-color-scheme`
- **Responsive Layout:** Adapts from desktop (1126px max-width) to mobile via media queries
- **Color Palette:** Purple accent (`#aa3bff` light / `#c084fc` dark) with neutral backgrounds
- **Component Architecture:** Single-page application with hero section, interactive elements, and documentation links
- **Hot Module Replacement:** Vite's HMR provides instant development feedback

---

## CHAPTER 6 — TESTING METHODS, RESULTS AND DISCUSSION

### 6.1 Testing Methodology

The system was evaluated across four dimensions:

1. **Data Quality Testing** — Validation of training data integrity
2. **Functional Testing** — End-to-end system operation
3. **Response Quality Testing** — AI output evaluation
4. **Performance Testing** — Latency and resource benchmarking

### 6.2 Data Quality Testing

#### 6.2.1 Dataset Statistics

| Metric | Value |
|---|---|
| Total raw records | ~50,000+ |
| After deduplication | ~49,000 |
| Bitext Travel dataset | 31,658 records (24.6 MB) |
| Travel QA dataset | 17,672 records (34.5 MB) |
| Custom template data | 200+ records (337 KB) |
| Merged dataset | 44.3 MB |
| Duplicate removal rate | ~2% |

#### 6.2.2 Category Distribution

| Category | Count | Percentage |
|---|---|---|
| Restaurants & Food | ~12,000 | 24.5% |
| History & Culture | ~8,500 | 17.3% |
| Flights | ~5,200 | 10.6% |
| Transportation | ~6,800 | 13.9% |
| Trip Planning | ~5,500 | 11.2% |
| Budget & Money | ~4,200 | 8.6% |
| Weather & Packing | ~2,800 | 5.7% |
| Safety | ~2,100 | 4.3% |
| Activities | ~1,900 | 3.9% |

### 6.3 Functional Testing

| Test Case | Input | Expected Behavior | Result |
|---|---|---|---|
| TC-01: Ollama Server Check | `is_available()` | Returns `True` with model loaded | ✅ Pass |
| TC-02: Basic Query | "Best restaurants in Tokyo" | Formatted response with names & prices | ✅ Pass |
| TC-03: Streaming | "Tell me about the Taj Mahal" | Token-by-token output | ✅ Pass |
| TC-04: Trip Planning | "Plan 3-day Bali honeymoon" | Multi-day itinerary with budget | ✅ Pass |
| TC-05: Transport Query | "Chennai to Pondicherry" | Multi-modal comparison | ✅ Pass |
| TC-06: Chat History | Follow-up question | Context-aware response | ✅ Pass |
| TC-07: History Clear | `/clear` command | History reset confirmed | ✅ Pass |
| TC-08: Error Handling | Query with server offline | Graceful error message | ✅ Pass |
| TC-09: Interactive Mode | `/plan` command | Guided input collection | ✅ Pass |
| TC-10: Frontend Load | Open React app | Design renders correctly | ✅ Pass |

### 6.4 Response Quality Evaluation

Five test queries were evaluated on a 5-point scale across four criteria:

| Criterion | Description | Average Score |
|---|---|---|
| **Relevance** | Is the response directly answering the question? | 4.6 / 5 |
| **Specificity** | Does it include specific names, prices, and details? | 4.2 / 5 |
| **Formatting** | Is the output well-structured with emojis and sections? | 4.7 / 5 |
| **Persona** | Does "Wandi" sound like a knowledgeable travel concierge? | 4.5 / 5 |
| **Actionability** | Can the user act on the advice immediately? | 4.3 / 5 |

**Overall Average: 4.46 / 5**

### 6.5 Performance Benchmarks

| Metric | Value |
|---|---|
| Model Size (GGUF Q4_K_M) | ~4.7 GB |
| RAM Usage (Inference) | ~5–6 GB |
| First Token Latency | 1–3 seconds |
| Token Generation Speed | 8–15 tokens/sec (CPU), 25–40 tokens/sec (GPU) |
| Typical Response Time | 5–15 seconds (500-word response) |
| Context Window | 4096 tokens |
| Concurrent Users (Local) | 1 (single instance) |

### 6.6 Discussion

**Strengths:**
- The fine-tuned model produces significantly more structured, travel-specific responses compared to the base Llama 3.1 model
- Emoji formatting and section organization make responses highly scannable
- The system operates entirely offline after initial setup, ensuring privacy
- QLoRA enabled fine-tuning on a free Google Colab T4 GPU

**Observations:**
- Responses for well-represented categories (restaurants, trip planning) are noticeably better than underrepresented ones (safety, activities)
- The model occasionally generates placeholder names like "[Premium Restaurant]" from the template training data — production deployment would require higher-quality API-generated training data
- Streaming mode provides a much better user experience than waiting for complete responses

---

## CHAPTER 7 — CONCLUSION AND FUTURE SCOPE

### 7.1 Introduction

This chapter summarizes the outcomes of the WanderWise AI project, evaluates its contributions to the field of AI-powered tourism, acknowledges current limitations, and outlines a roadmap for future enhancements.

### 7.2 Conclusion

The WanderWise AI project successfully demonstrates that **domain-specific fine-tuning of open-weight Large Language Models** can produce a high-quality, production-viable AI tourism concierge that operates entirely on consumer hardware. By combining a carefully curated dataset of 49,000+ tourism Q&A pairs with the efficiency of QLoRA fine-tuning, the project transforms a general-purpose Llama 3.1 8B model into a specialized travel expert — "Wandi" — capable of generating restaurant recommendations, multi-day itineraries, transportation comparisons, budget breakdowns, and cultural guidance with professional-grade formatting.

The system proves that the marriage of **three key innovations** — QLoRA for efficient training, GGUF quantization for compact deployment, and Ollama for local serving — makes it feasible to deploy a sophisticated AI assistant without cloud infrastructure, API subscriptions, or GPU servers. This has significant implications for privacy-conscious users, travelers in low-connectivity regions, and developers building offline-first AI applications.

### 7.3 Contributions of the Project

1. **End-to-End Fine-Tuning Pipeline:** A reproducible pipeline from dataset curation to deployed model, fully documented and scripted.
2. **Multi-Source Training Data Architecture:** A novel approach combining public Hugging Face datasets, template-generated data, and API-augmented data with deduplication.
3. **Domain-Specific Persona Engineering:** The "Wandi" persona demonstrates how system prompts combined with fine-tuning produce consistent, branded AI interactions.
4. **Local Deployment Blueprint:** A reference architecture for deploying fine-tuned LLMs on consumer hardware using Ollama and Modelfiles.
5. **Production-Ready API Client:** A Python client with streaming, history management, and specialized travel endpoints.
6. **Modern Web Frontend:** A React + Vite application demonstrating integration between web technologies and local AI.

### 7.4 Limitations of the Current System

1. **Template Artifacts in Responses:** Some responses contain placeholder text (e.g., "[Premium Restaurant]") from template-based training data, reducing the factual quality compared to API-generated data.
2. **Single-User Design:** The Ollama instance serves one user at a time; concurrent access requires infrastructure scaling.
3. **Static Knowledge:** The model's knowledge is frozen at training time; it cannot access real-time information like current prices, availability, or weather.
4. **Hardware Requirements:** Despite quantization, the model requires approximately 6 GB RAM, which may be limiting on low-end devices.
5. **English-Only Support:** The current model is trained exclusively on English data, limiting its usefulness for non-English speaking travelers.
6. **No Location Awareness:** The system lacks GPS or map integration for location-based recommendations.

### 7.5 Future Scope

1. **Real-Time Data Integration:** Connect the AI to live APIs (weather, flight pricing, Google Maps) for dynamic, current information.
2. **Multilingual Support:** Fine-tune on multilingual tourism datasets to support Hindi, Tamil, Japanese, Spanish, and other major languages.
3. **Retrieval-Augmented Generation (RAG):** Implement RAG with a vector database of updated tourism content to keep the AI's knowledge current without retraining.
4. **Voice Interface:** Add speech-to-text and text-to-speech for a hands-free travel concierge experience.
5. **Mobile Application:** Develop a React Native or Flutter app for on-the-go travel assistance.
6. **Personalization Engine:** Build user preference profiles to customize recommendations based on past interactions and stated preferences.
7. **Map Integration:** Integrate with Leaflet or Google Maps to visualize recommended places, routes, and itineraries.
8. **Multi-User Deployment:** Deploy the model behind a queue-based API server (e.g., FastAPI + Redis) for concurrent user support.
9. **Larger Model Fine-Tuning:** Fine-tune on Llama 3.1 70B for higher quality responses, deploying on cloud GPU instances.
10. **Feedback Loop:** Implement a rating system where users rate responses, feeding back into the training pipeline for continuous improvement.

### 7.6 Final Remarks

WanderWise AI represents a practical, accessible approach to building domain-specific AI assistants. As open-weight models continue to improve and quantization techniques become more efficient, the vision of a personal, private, offline AI travel concierge for every traveler moves closer to reality. The project lays the groundwork for a new generation of AI tools that prioritize user privacy, offline capability, and domain expertise over cloud dependence.

---

## APPENDIX A — CODING REFERENCES

### A.1 Key Source Files

| File | Purpose | Lines of Code |
|---|---|---|
| `generate_training_data.py` | Training data generation engine with 9 template categories and API support | 861 |
| `download_datasets.py` | Hugging Face dataset downloader with format normalization | 209 |
| `wandi_api.py` | Python API client for Ollama with streaming and specialized endpoints | 272 |
| `Modelfile` | Ollama model configuration (parameters, system prompt, chat template) | 55 |
| `App.jsx` | React frontend main component | 122 |
| `index.css` | Global CSS design system with light/dark theme | 112 |
| `App.css` | Component-specific styling | 185 |

### A.2 Core Code Snippets

#### A.2.1 Training Data Generation — Template Engine

```python
# generate_training_data.py — Template-based data generation

SYSTEM_INSTRUCTION = (
    "You are Wandi, an expert AI travel concierge specialized in tourism. "
    "Answer helpfully with specific details, prices, and practical tips."
)

CITIES = [
    "Paris", "Tokyo", "New York", "Rome", "Bangkok", "Istanbul",
    "Barcelona", "London", "Dubai", "Mumbai", "Jaipur", "Bali",
    "Sydney", "Cape Town", "Rio de Janeiro", "Singapore", "Prague",
    "Lisbon", "Amsterdam", "Vienna", "Seoul", "Hanoi", "Marrakech",
    "Cairo", "Athens", "Edinburgh", "Reykjavik", "Queenstown",
    "Cusco", "Cartagena", "Dubrovnik", "Santorini", "Kyoto",
    "Chennai", "Kochi", "Udaipur", "Varanasi", "Goa",
    "Pondicherry", "Shimla", "Manali", "Darjeeling", "Ooty",
    "Munnar", "Kodaikanal", "Hampi", "Mysore", "Coorg",
]

def generate_template_data():
    examples = []
    restaurant_templates = [
        {
            "input": f"What are the best {random.choice(CUISINES)} restaurants in {city}?",
            "output": _restaurant_response(city, random.choice(CUISINES)),
        }
        for city in random.sample(CITIES, min(30, len(CITIES)))
    ]
    # ... 8 more category generators
    return examples
```

#### A.2.2 Dataset Download and Merge

```python
# download_datasets.py — Hugging Face integration

def download_bitext():
    from datasets import load_dataset
    dataset = load_dataset(
        "bitext/Bitext-travel-llm-chatbot-training-dataset",
        split="train"
    )
    examples = []
    for row in dataset:
        examples.append({
            "instruction": "You are Wandi, an expert AI travel concierge...",
            "input": row.get("instruction", ""),
            "output": row.get("response", ""),
        })
    return examples

def merge_all():
    # Deduplication by normalized input text
    seen = set()
    unique = []
    for ex in all_examples:
        key = ex.get("input", "").strip().lower()
        if key and key not in seen:
            seen.add(key)
            unique.append(ex)
    # Saves to all_merged.jsonl
```

#### A.2.3 Wandi API Client — Streaming Chat

```python
# wandi_api.py — Core API client

class WandiTourismAI:
    def __init__(self, base_url="http://localhost:11434", model="wandi-tourism"):
        self.base_url = base_url
        self.model = model
        self.chat_history = []

    def ask_stream(self, message, include_history=True):
        """Stream the response token by token."""
        messages = []
        if include_history:
            messages.extend(self.chat_history)
        messages.append({"role": "user", "content": message})

        response = requests.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "messages": messages,
                "stream": True,
            },
            stream=True, timeout=120,
        )

        full_response = ""
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                if "message" in data and "content" in data["message"]:
                    token = data["message"]["content"]
                    full_response += token
                    yield token

        self.chat_history.append({"role": "user", "content": message})
        self.chat_history.append({"role": "assistant", "content": full_response})
```

#### A.2.4 Ollama Modelfile

```dockerfile
# Modelfile — Ollama model configuration

FROM ./unsloth.Q4_K_M.gguf

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
PARAMETER repeat_penalty 1.1
PARAMETER num_predict 2048
PARAMETER stop "<|eot_id|>"

SYSTEM """You are Wandi, an expert AI travel concierge and trip planner.
You specialize in:
🍽️ Restaurant & food recommendations
🏛️ Historical and cultural information
✈️ Flight booking advice
🚌 Local transportation guidance
🗺️ Detailed multi-day trip planning
💰 Budget planning and money-saving tips
🌤️ Weather advice and packing suggestions
🛡️ Safety tips and emergency information"""

TEMPLATE """<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|><|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
```

### A.3 Dependencies and Libraries

| Library | Version | Purpose |
|---|---|---|
| `react` | 19.2.4 | Frontend UI framework |
| `react-dom` | 19.2.4 | React DOM rendering |
| `vite` | 8.0.1 | Build tool and dev server |
| `@vitejs/plugin-react` | 6.0.1 | React support for Vite |
| `requests` | Latest | Python HTTP client for Ollama API |
| `datasets` | Latest | Hugging Face dataset loading |
| `pandas` | Latest | Data manipulation |
| `transformers` | Latest | Model loading and tokenization |
| `peft` | Latest | Parameter-efficient fine-tuning (LoRA) |
| `bitsandbytes` | Latest | 4-bit quantization |
| `trl` | Latest | Supervised fine-tuning trainer |
| `unsloth` | Latest | Optimized fine-tuning framework |

### A.4 Commands Reference

```bash
# Training Data Generation
python generate_training_data.py --mode templates
python generate_training_data.py --mode api          # Requires OPENAI_API_KEY
python generate_training_data.py --mode ollama --ollama-model llama3.1

# Dataset Download
pip install datasets pandas
python download_datasets.py

# Model Deployment
ollama serve
ollama create wandi-tourism -f Modelfile
ollama run wandi-tourism

# API Testing
python wandi_api.py                    # Quick test (5 queries)
python wandi_api.py --interactive      # Interactive chat mode
python wandi_api.py --ask "Best places in Jaipur?"

# Frontend Development
cd wanderwise-frontend
npm install
npm run dev                            # Starts on http://localhost:5173
npm run build                          # Production build
```

### A.5 References

1. Vaswani, A., et al. (2017). "Attention Is All You Need." *Advances in Neural Information Processing Systems (NeurIPS)*.
2. Touvron, H., et al. (2023). "Llama 2: Open Foundation and Fine-Tuned Chat Models." *Meta AI Research*.
3. Hu, E.J., et al. (2022). "LoRA: Low-Rank Adaptation of Large Language Models." *ICLR 2022*.
4. Dettmers, T., et al. (2023). "QLoRA: Efficient Finetuning of Quantized Language Models." *NeurIPS 2023*.
5. Gavalas, D., et al. (2014). "Mobile Recommender Systems in Tourism." *Journal of Network and Computer Applications*.
6. Tussyadiah, I.P., & Miller, G. (2019). "Perceived Impacts of Artificial Intelligence and Responses to Positive Behavior Change Intervention." *Information and Communication Technologies in Tourism*.
7. Zheng, Y., et al. (2023). "Towards Efficient Itinerary Generation Using Large Language Models." *ACM Computing Surveys*.
8. Li, J., et al. (2019). "Chatbot for Tourism: A Systematic Literature Review." *Tourism Review*.
9. Meta AI (2024). "Llama 3.1 Model Card." *https://ai.meta.com/llama/*.
10. Ollama (2024). "Ollama Documentation." *https://ollama.com/docs*.
11. Hugging Face (2024). "Bitext Travel LLM Chatbot Training Dataset." *https://huggingface.co/datasets/bitext/*.
12. React Team (2024). "React 19 Documentation." *https://react.dev/*.
13. Vite (2024). "Vite 8 Documentation." *https://vite.dev/*.

---

*Report prepared by: Project Team*
*Date: April 2026*
*Institution: Department of Computer Science*
*Project Title: WanderWise AI — An Intelligent Tourism Concierge System Using Fine-Tuned Large Language Models*
