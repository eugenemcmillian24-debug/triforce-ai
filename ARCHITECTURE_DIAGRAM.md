graph TD
    A[User Visits triforce-ai.pages.dev] --> B[Landing Page]
    B --> C{Choose Builder}
    
    C -->|App Builder| D[Full Stack Generator]
    C -->|Workflow Builder| E[Visual Pipeline Builder]
    C -->|Repo Repair| F[Code Analysis]
    
    D --> G[Describe Your App]
    G --> H{AGI Detection}
    
    H -->|Standard| I[Single Model]
    H -->|AGI Mode| J[Multi-Chain]
    
    I --> K[Provider Router]
    J --> K
    
    K --> L{Rate Limit Check}
    L -->|Available| M[Call Provider]
    L -->|Limited| N[Fallback Cascade]
    
    N --> M
    
    M --> O{Success?}
    O -->|Yes| P[Stream Response]
    O -->|No| Q[Next in Cascade]
    Q --> M
    
    P --> R[Update UI]
    R --> S[Save to D1 Database]
    
    subgraph Providers[15 Free AI Providers]
        P1[Groq - Llama 3.3]
        P2[OpenRouter - GPT/Claude]
        P3[Mistral - Codestral]
        P4[HuggingFace - Free Tier]
        P5[GitHub Models - GPT-4.1]
        P6[Google Gemini - 2.5 Pro]
        P7[Cerebras - Llama 3.3]
        P8[NVIDIA NIM - Nemotron]
        P9[Cohere - Command R+]
        P10[Together - Open Source]
        P11[DeepSeek - R1]
        P12[Zhipu - GLM-4]
        P13[AiML - Multi-Provider]
        P14[Cloudflare AI - Workers]
        P15[SambaNova - Enterprise]
    end
    
    M --> Providers
    
    subgraph Infrastructure[Cloudflare Infrastructure]
        T1[Pages - Frontend]
        T2[D1 - Database]
        T3[KV - Rate Limits]
        T4[Workers - API]
    end
    
    A --> T1
    S --> T2
    L --> T3
    K --> T4
