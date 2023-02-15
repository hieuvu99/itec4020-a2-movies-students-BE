const express = require('express')
const router = new express.Router()

// models
const Movie = require(__basedir + '/models/movie')
const Comment = require(__basedir + '/models/comment')

const DEFAULT_MOVIES_PER_PAGE = 9
const DEFAULT_COMMENTS_PER_PAGE = 3

/**
 * Some API endpoints in this application are sorted and paginated. Here, we will go over
 * some details about sorting and paginating the resulting movies.
 * 
 * In this applicaiton, we sort the movies in our database based on "popularity" in a decreasing order
 * so that top results are the most popular ones. To learn how to use sort in mongoose,
 * please visit their documentation: https://mongoosejs.com/docs/api.html#query_Query-sort
 * 
 * Pagination is used to return parts of the results to the user in series of pages.
 * You can read about pagination in mongodb here: https://docs.mongodb.com/manual/reference/method/cursor.skip/#pagination-example
 * For example imagine that maximum number of items per page is 5 and we have 7 items in
 * out database. As a result, we need to return the first 5 elements in the first page.
 * For the second page, we need to `skip` over the first 5 elements and return the remaining
 * elements (up to a maximum of 5). As a result, our query from the database for paginated
 * results would typically look like this:
 *    const results = await Movie.find({...}).sort({...}).skip((page - 1) * limit).limit(limit)
 * Note: `page` is the page that we want to fetch the results for and `limit` is the maximum
 * number of elements allowed per page. In our previous example, limit was 5.
 * Note: the number of pages can be calculated as `Math.ceil(count / limit)`
 * 
 * In this application, we will use the `DEFAULT_MOVIES_PER_PAGE` variable as the maximum 
 * number of items per page for the endpoints
 * that return a list of movies and `DEFAULT_COMMENTS_PER_PAGE` variable as the maximum 
 * number of items per page for the endpoints that returna  list of comments.
 */

// GET /movies -> gets a list of movies, sorted and paginated
router.get('/movies', async (req, res) => {
  // TODO: fill out the code for the endpoint
  try {
    var pageNumber = req.query.page;  
    if(pageNumber == null)
      pageNumber=1;
  
    const result = await  Movie.find({})
                                .sort({popularity : -1})
                                .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * DEFAULT_MOVIES_PER_PAGE ) : 0 )
                                .limit( DEFAULT_MOVIES_PER_PAGE )
                                .exec();
    
    const count = await Movie.count();
    
    res.status(202).send({
        data : result,
        count : count,
        pagination : {
          page : pageNumber,
          pageCount : Math.ceil(count / DEFAULT_MOVIES_PER_PAGE)
        }                 
      })
  } catch (error) {
    res.status(404).send({
      error : error.stack                
    })
  }
})

// GET /movies/:id --> gets a movie by id
router.get('/movies/:id', async (req, res) => {
  // TODO: fill out the code for the endpoint
  try {
    const id = req.params.id;
  const result = await  Movie.find({
    _id : id}).exec();
  

  if (result === undefined || result.length == 0 ) {
    return res.status(404).send({
      err:{
        id: "The ID was not found!"
      }
    })
  }
  return res.status(202).send(result)
  } catch (error) {
    console.log(error.stack)
    return res.status(404).send({
      err: error.stack
    })
  }
  
})

// POST /search/movies/by-genres --> searches for JSON array of genres we want to search in, sorted and paginated
/**
 * Note: only return movies that match **all** genres. For example, if out request says
 * `["Thriller", "Action"]`, we need to look for movies that are BOTH thriller AND action.
 * For more information, see: https://docs.mongodb.com/manual/reference/operator/query/all/
 */
router.post('/search/movies/by-genres', async (req, res) => {
  // TODO: fill out the code for the endpoint  
  try {
    
    const genres = req.body;
    var pageNumber = req.query.page;    
    if(pageNumber == null)
      pageNumber=1;
  
    const count = await Movie.find({ genres: { $all: genres } })
                              .count()
                              .exec();
    
    if(count === 0)
      {return res.status(404).send({msg : "There aren't any movies contain these genres"})} 
    const result = await  Movie.find({ genres: { $all: genres } })
                                .sort({popularity : -1})
                                .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * DEFAULT_MOVIES_PER_PAGE ) : 0 )
                                .limit( DEFAULT_MOVIES_PER_PAGE )
                                .exec();
     
    const pageCount = Math.ceil(count / DEFAULT_MOVIES_PER_PAGE);
  
   
  
    res.status(202).send({
        data : result,
        count : count,
        pagination : {
        page : pageNumber,
        pageCount : pageCount
      }
    })
  } catch (error) {
    res.status(404).send({err: error.stack})
  }  

})

// POST /search/movies/by-countries --> searches for movies with JSON array of countries
/**
 * Note: here, return movies with production_countries matching to ANY of the countries
 * listed. For example for a request for ["Canada","United States of America"], we need
 * to return any movies that include either Canada or the USss in their production countries
 * list.
 * For more information, see: https://docs.mongodb.com/manual/reference/operator/query/in/
 */
router.post('/search/movies/by-countries', async (req, res) => {
  // TODO: fill out the code for the endpoint  const result = await  Movie.find({ genres: { $all: genres } })
  try {
    const countries = req.body;
    var pageNumber = req.query.page.trim();
    if(pageNumber == null)
    pageNumber=1;  
    const count = await Movie.find({ production_countries: { $in: countries } }).count().exec();
     
    if(count === 0)
      return res.status(404).send({msg : "There aren't any movies products in one of these countries "})
     
    const result = await  Movie.find({ production_countries: { $in: countries } })
                                .sort({popularity : -1})
                                .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * DEFAULT_MOVIES_PER_PAGE ) : 0 )
                                .limit( DEFAULT_MOVIES_PER_PAGE )
                                .exec();
     
  
    res.status(202).send({
      data : result,  
      count : count,
      pagination : {
      page : pageNumber.trim(),
      pageCount : Math.ceil(count / DEFAULT_MOVIES_PER_PAGE)
      }
    })                        
  } catch (error) {
    res.status(404).send({err: error.stack})
  }
})

// POST /movies/:id/comments --> creates a comment for a movie, gets the object structure as JSON
/**
 * Note: here we want to `populate` the movie field.
 * For more information, see: https://mongoosejs.com/docs/populate.html
 */
router.post('/movies/:id/comments', async (req, res) => {
  // TODO: fill out the code for the endpoint
  try {
    
    const id = req.params.id;
    const text = req.body.text;
  
    if(text==="") 
      return res.status(404).send({
        err:{
          id: "You havent Comment anything yet!"
        }
    })
  
    const newComment = new Comment({
      movie : id,
      text : text,
    });
    await newComment.save()
    
    const result =  await Comment.findOne({_id: newComment._id})
                                .populate('movie').exec();
  
    return res.status(200).send({
      msg: "Success",
      comment: result
      })
  } catch (error) {
    res.status(404).send({err: error.stack})
  }
})

// GET /movies/:id/comments --> gets the comments for a movie, paginated, sorted by posting date (descending, meaning from new to old)
router.get('/movies/:id/comments', async (req, res) => {
  // TODO: fill out the code for the endpoint
  try {
    
    const id = req.params.id;
    var pageNumber = req.query.page;
    if(pageNumber === null)
      pageNumber=1;   
  
    const result = await  Comment.find({movie: id})
    .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * DEFAULT_COMMENTS_PER_PAGE ) : 0 )
    .sort({"createdAt": -1})
    .limit( DEFAULT_COMMENTS_PER_PAGE )
    .populate('movie')
    .exec();
  
    const count = await Comment.find({movie: id}).count();
     
  
    res.status(202).send({
      data : result,
      count : count,
      pagination : {
        page : pageNumber,
        pageCount : Math.ceil(count / DEFAULT_COMMENTS_PER_PAGE)
      }
    })
  } catch (error) {
    res.status(404).send({
      error: error.stack
    })
  } 
})

router.post('/test', async (req, res) => {
  try {
    const search = req.body.search;
    const result = await  Movie.find({"$match":{
          "title": {"regex": search, "$options": "i" }
          } 
        },function(err,docs) { 
        } 
      )
    .sort({popularity : -1})
    .skip( 1 > 0 ? ( ( 1 - 1 ) * DEFAULT_MOVIES_PER_PAGE ) : 0 )
    .limit( DEFAULT_MOVIES_PER_PAGE )
    .exec();
    res.status(200).send({data:result})
  } catch (error) {
    res.status(404).send({error:error.stack})
  }
})
module.exports = router
