// api.js - Supabase Data Layer

const API = {
    client: null,

    init: function () {
        if (window.supabase) {
            this.client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        } else {
            console.error("Supabase SDK not loaded");
        }
    },

    // Fetch all memories
    getMemories: async function () {
        if (!this.client) this.init();
        const { data, error } = await this.client
            .from('memories')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('API Error:', error);
            return [];
        }
        return data;
    },

    // Add a new memory
    addMemory: async function (memory) {
        if (!this.client) this.init();

        // Ensure user_id is attached
        const user = Auth.getUser();
        if (user) {
            memory.user_id = user.identifier || user.email; // MojoAuth usually returns 'identifier'
        }

        const { data, error } = await this.client
            .from('memories')
            .insert([memory]);

        if (error) throw error;
        return data;
    },

    // Delete a memory
    deleteMemory: async function (id) {
        if (!this.client) this.init();
        const { error } = await this.client
            .from('memories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
