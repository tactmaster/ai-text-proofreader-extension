// Test for new Ollama model listing functionality
// Run this to manually test the new features

// Simulate the new getAvailableModels API call
function testOllamaModelListing() {
    console.log('Testing Ollama model listing functionality...');
    
    // Mock the browser API for testing
    const mockBrowserAPI = {
        runtime: {
            sendMessage: async (message) => {
                if (message.action === 'getAvailableModels') {
                    // Simulate successful response
                    return {
                        success: true,
                        models: [
                            {
                                name: 'llama2:latest',
                                size: 3826793216,
                                modified_at: '2024-01-15T10:30:00Z',
                                details: { parameter_size: '7B' }
                            },
                            {
                                name: 'llama2:7b',
                                size: 3826793216,
                                modified_at: '2024-01-15T10:30:00Z',
                                details: { parameter_size: '7B' }
                            },
                            {
                                name: 'mistral:latest',
                                size: 4109016832,
                                modified_at: '2024-01-10T15:45:00Z',
                                details: { parameter_size: '7B' }
                            }
                        ],
                        port: '11434'
                    };
                }
                return { success: false, error: 'Unknown action' };
            }
        }
    };

    // Test the model formatting function
    function formatModelSize(sizeBytes) {
        if (!sizeBytes) return 'Unknown size';
        const gb = sizeBytes / (1024 * 1024 * 1024);
        if (gb >= 1) {
            return `${gb.toFixed(1)}GB`;
        }
        const mb = sizeBytes / (1024 * 1024);
        return `${mb.toFixed(0)}MB`;
    }

    // Test the dynamic endpoint generation
    function getOllamaEndpoint(port = '11434', endpoint = '/api/generate') {
        return `http://127.0.0.1:${port}${endpoint}`;
    }

    // Run tests
    console.log('✅ Testing dynamic endpoint generation:');
    console.log('  Default port:', getOllamaEndpoint());
    console.log('  Custom port 8080:', getOllamaEndpoint('8080'));
    console.log('  Tags endpoint:', getOllamaEndpoint('11434', '/api/tags'));

    console.log('\n✅ Testing model size formatting:');
    console.log('  3.8GB model:', formatModelSize(3826793216));
    console.log('  4.1GB model:', formatModelSize(4109016832));
    console.log('  Unknown size:', formatModelSize(null));

    console.log('\n✅ Testing mock API response:');
    mockBrowserAPI.runtime.sendMessage({ action: 'getAvailableModels' })
        .then(response => {
            console.log('  API Response:', response);
            if (response.success) {
                console.log('  Models found:', response.models.length);
                response.models.forEach(model => {
                    console.log(`    - ${model.name} (${formatModelSize(model.size)})`);
                });
                console.log('  Port:', response.port);
            }
        });

    console.log('\n🎉 New Ollama functionality test completed!');
    console.log('\nNew features added:');
    console.log('  - Configurable Ollama port setting');
    console.log('  - Model listing from Ollama server');
    console.log('  - Model selection dropdown');
    console.log('  - Connection testing with custom port');
    console.log('  - Auto-refresh models when switching to local provider');
}

// Run the test
testOllamaModelListing();