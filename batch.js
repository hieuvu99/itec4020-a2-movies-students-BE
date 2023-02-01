import fetch from "node-fetch";
import { MongoClient } from "mongodb"
import ENV from "dotenv"
import axios from "axios"

ENV.config();
const { MONGO_CONN_URL } = process.env;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const batchImport = async () => {
    const client = new MongoClient(MONGO_CONN_URL, options);
    await client.connect();
    const db = client.db("a2-movies");
    console.log("connected!");
    
    let data = await db.collection("movies").find().toArray();

    client.close();
    console.log("disconnected!");
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      let errcount = 0;
      let count = 0;
      let array = [];
      async function replacePoster(Element){



            


        try{
          
            var result = await fetch(`https://api.themoviedb.org/3/movie/${Element.original_id}?api_key=e804947d3908fcc5b0353a5fcab28bf8&language=en-US`, requestOptions);
            let oldPoster = Element.poster_path

           
            result = await result.text()
            result = await JSON.parse(result)
            Element.poster_path = result.poster_path
            
            console.log(Element.poster_path===oldPoster)

            }
            catch(err){
                console.log(err.stack)
            }   
      }

      
        data.map(async (Element) =>{
            try{
               array.push(replacePoster(Element))
                }
                catch(err){
                    console.log(err.stack)
                }     
        })

        Promise.all(array);

    
    
   
       
        
        
         
    
}

batchImport()
    

  