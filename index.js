//Importamos las librarías requeridas
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express();

//actualizacion a una funcion moderna e incluida en express
app.use(express.json());



// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');
    //llamamos alas funciones
    borrarTabla(()=>{
       crearTabla(); 
    });
   
});

//funcion borrar tabla
function borrarTabla (callback){
    db.run('DROP TABLE IF EXISTS todos'), (err) => {
        if(err){
            console.error('Error al borrar la tabla:', err.message);
        }else {
            console.log('Tabla borrada correctamente.')
        }
        if(callback) callback(); //lamamos el siguiente paso
    }
}

// funcion para la creacion de la tabla todos
function crearTabla(){
     db.run(`CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at DATATIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla todos creada exitosamente.');
        }
    });
}
//Creamos un endpoint llamado agrega_todo
app.post('/agrega_todo', (request, response) => {
    //Imprimimos el contenido del campo todo
    const { todo } = request.body;
   
    console.log(todo);
    response.setHeader('Content-Type', 'application/json');
    

    if (!todo) {
        // regresamos un 400 cuando una poeticion no es correcta es decir le falta algun dato
        response.status(400).send('Bad Request');
        return;
    }
    //insertamos los datos de la peticion en la base de datos
    const stmt  =  db.prepare('INSERT INTO todos (todo) VALUES (?)');

    stmt.run(todo, (err) => {
        if (err) {
          console.error("Error running stmt:", err);
          response.status(500).send(err);
          return;

        } else {
          console.log("Insert was successful!");
        }
    });

    stmt.finalize();
    
    //Enviamos de regreso la respuesta
    response.status(201).send();
})



app.get('/', (req, res) => {
    //Enviamos de regreso la respuesta
    res.json({ 'status': 'ok2' });
})



//Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`)
})
