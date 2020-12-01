import express from 'express';
import bodyParser from 'body-parser';
import { IndexRouter } from './controllers/index.router';
import { sequelize } from './sequelize';
import { MODELS } from './controllers/model.index';

(async () => {

  await sequelize.addModels(MODELS);
  await sequelize.sync();

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.use('/api/', IndexRouter);

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /api/filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();