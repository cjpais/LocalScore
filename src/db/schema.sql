-- Core tables
CREATE TABLE accelerators (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(16) NOT NULL,       -- intended to be cpu, gpu, tpu, etc.
    memory_gb DECIMAL(10,2),
    manufacturer VARCHAR(255),       -- apple, nvidia, intel, amd, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE models (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    -- TODO what else can we get from llama.cpp easily
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_variants (
    id UUID PRIMARY KEY,
    model_id UUID REFERENCES models(id),
    -- variant_name VARCHAR(255), -- TODO remove?
    quantization VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE runtimes (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(255),
    commit_hash VARCHAR(255),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- TODO runtime types? Vision, Language, etc?

-- System information for benchmark runs
CREATE TABLE benchmark_systems (
    id UUID PRIMARY KEY,
    cpu_name VARCHAR(255),
    cpu_architecture VARCHAR(255),
    ram_gb INTEGER,
    kernel_type VARCHAR(255),
    kernel_release VARCHAR(255),
    system_version VARCHAR(255),
    system_architecture VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Main benchmark results table
CREATE TABLE benchmark_runs (
    id UUID PRIMARY KEY,
    system_id UUID REFERENCES benchmark_systems(id),
    accelerator_id UUID REFERENCES accelerators(id),
    model_variant_id UUID REFERENCES model_variants(id),
    runtime_id UUID REFERENCES runtimes(id),
    run_date TIMESTAMP WITH TIME ZONE,
    -- driver_version VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Detailed test results
CREATE TABLE test_results (
    id UUID PRIMARY KEY,
    benchmark_run_id UUID REFERENCES benchmark_runs(id),
    test_name VARCHAR(255), -- e.g., 'pp16', 'tg32', 'pp1024+tg256'
    prompt_length INTEGER,
    generation_length INTEGER,
    avg_time_ms DECIMAL(15,2),
    power_watts DECIMAL(10,2),
    tokens_processed INTEGER,
    tokens_per_second DECIMAL(10,2),
    tokens_per_second_per_watt DECIMAL(10,4),
    context_window_size INTEGER,
    vram_used_mb DECIMAL(10,2),
    time_to_first_token_ms DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);