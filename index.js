//Importamos las librarías requeridas
const express = require('express');
const { status } = require('express/lib/response');
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
    db.run('DROP TABLE IF EXISTS todos', (err) => {
        if(err){
            console.error('Error al borrar la tabla:', err.message);
        }else {
            console.log('Tabla borrada correctamente.')
        }
        if(callback) callback(); //llamamos el siguiente paso
    });
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
app.post('/insert', (req, res) => {
    //Imprimimos el contenido del campo todo
    const { todo } = req.body;
   
    console.log(todo);
    

    if (!todo) {
        // regresamos un 400 cuando una poeticion no es correcta es decir le falta algun dato
        res.status(400).send('Bad Request');
        return;
    }
    //insertamos los datos de la peticion en la base de datos
    const stmt  =  db.prepare('INSERT INTO todos (todo) VALUES (?)');

    stmt.run(todo, (err) => {
        if (err) {
          console.error("Error running stmt:", err);
          res.status(500).send(err);
          return;

        } else {
          console.log("Insert was successful!");
        }
    });
    
    //Enviamos de regreso la respuesta
    res.status(201);
    res.json({'Message': 'Created'});
    stmt.finalize();
})



app.get('/', (req, res) => {
    //preparamos la consulta
    const select = 'SELECT * FROM todos';

    //ejecutamos db.all para traer todo en un arreglo
    db.all(select,[],(err, rows)=>{
        if(err){
            console.log('Error en la consulta:', err.message);
            res.status(500).json({ error: 'Error al consultar la base de datos'});
        }
        //enviamos los resultados como JSON
        res.json({
            status: 'ok',
            data: rows
        });
    });
});

app.post('/login',(req, res)=>{
    res.status(200).json({ 'status': 'ok' });
});



// Solo escuchamos el puerto si este archivo es el principal (no es un test)
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Aplicación corriendo en http://localhost:${port}`);
    });
}

// Exportamos app y db para usarlos en los tests
module.exports = { app: app, db };
