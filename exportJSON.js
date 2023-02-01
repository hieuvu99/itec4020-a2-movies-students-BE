
import fetch from "node-fetch";
import throttledQueue from 'throttled-queue'

let throttle = throttledQueue(15, 1000) // 15 times per second
let arr = []
for (let index = 0; index <= 2000; index++) {
   arr.push(throttle (function() {
    fetchData(index)
   }))
    
}
console.log(arr.length)

async function fetchData(index){
    try{
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
              
        var result = await fetch(`https://api.themoviedb.org/4/discover/movie?api_key=e804947d3908fcc5b0353a5fcab28bf8&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${index}&with_watch_monetization_types=flatrate`, requestOptions);
       
    
       
         result = await result.text()
         result = await JSON.parse(result)
        result = result.results
        result.forEach(element => {
           arr.push(element) 
        });
        
    
        }
        catch(err){
            console.log(err.stack)
        } 
}
  