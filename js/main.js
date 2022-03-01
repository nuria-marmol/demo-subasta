import { createApp } from "./vue.esm-browser.js"

// Las mismas que en el ejercicio del chat, ya que hemos usado la misma base de datos (nueva tabla)
const supabaseUrl = 'https://uzkhgygphepqkeknjokr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a2hneWdwaGVwcWtla25qb2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYwMzg5OTYsImV4cCI6MTk2MTYxNDk5Nn0.6r2rJflexymT_20SIm4U-fhwSe0UBKo2h-uRYpIMKV4';
const cli = supabase.createClient(supabaseUrl, supabaseKey);

createApp({
    data() {
        return {
            pujas: [],
            nuevaCantidad: "",
            bloquear: true
        }
    },
    methods: {
        cargarPujas: async function() {
            let { data: data, error } = await cli
                // De la tabla de pujas (Supabase), coge todas las columnas
                .from('Pujas')
                .select('*')
                // Para que se ordene la cantidad de menor a mayor
                .order('cantidad', { ascending: true })
            // Metemos la info en el array de pujas
            this.pujas = data;
        },
        enviarNuevaPuja: async function() {
            const { data: data, error } = await cli
                // En la tabla pujas (Supabase), metemos nuevas filas
                .from('Pujas')
                .insert([
                    // La columna de nuestra tabla
                    { cantidad: this.nuevaCantidad }
                ])
                // Ordenamos de menor a mayor
                .order('cantidad', { ascending: true })
            // Limpiamos el input
            this.nuevaCantidad = "";
        },
        // Ahora ya no hay que refrescar para que los cargue
        escucharNuevasPujas: function() {
            cli
                .from('Pujas')
                .on('INSERT', payload => {
                    // Añadimos nueva puja
                    this.pujas.push(payload.new);
                })
                .subscribe()
        }
    },
    watch: {
        // Vigilamos si hay cambios en el input
        nuevaCantidad(newValue, OldValue) {
            // Si la cantidad que ha metido el usuario es mayor a la puja más alta
            if (newValue > this.pujas[this.pujas.length - 1].cantidad) {
                // Bloquear pasa a ser false, por lo que se habilita el botón
                this.bloquear = false;
            }
        }
    },
    mounted() {
        this.cargarPujas();
        this.escucharNuevasPujas();
    }
}).mount('#app')