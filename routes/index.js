var express = require('express');
var router = express.Router();
var request = require('request');
var History = require("../history");
/* GET home page. */
router.get('/api/imagesearch/:search', function(req, res) {
    console.log("Searching", req.params.search);
    var url;
    if(req.query.offset > 0){
        url = 'https://www.googleapis.com/customsearch/v1?cx=000607463372409205852:4qcvgaxseki&q=' + req.params.search.split("?")[0] + '&start=' + req.query.offset + 'key=AIzaSyBguNEm73K0AGD83hMm4tkcXG9LXXAkzH0';
    }else{
        url = 'https://www.googleapis.com/customsearch/v1?cx=000607463372409205852:4qcvgaxseki&q=' + req.params.search + '&key=AIzaSyBguNEm73K0AGD83hMm4tkcXG9LXXAkzH0';
    }
    console.log("URL", url);
    request(url, function(error, response, body) {
        var jsonBody = JSON.parse(body);
        if (error) {
            res.json({
                "status": "Error"
            });
        }
        else {
            var history = new History(); 
            history.when = Date();
            history.term = req.params.search;
            console.log("Saving in history");
            history.save(function(err) {
                console.log("In save callback", err);
                if (err) {
                    res.json({
                        "status": "Error"
                    });
                }else{
                    console.log("Save successful");
                    var finArray = jsonBody.items.map(function(item){
                        var object = {};    
                        if(item.pagemap && item.pagemap.cse_thumbnail && item.pagemap.cse_thumbnail.length > 0){
                            object.thumbnail = item.pagemap.cse_thumbnail[0].src;
                        }
                        if(item.pagemap && item.pagemap.cse_image && item.pagemap.cse_image.length > 0){
                            object.url = item.pagemap.cse_image[0].src;
                        }
                        if(item.snippet){
                            object.snippet = item.snippet;
                        }
                        if(item.displayLink){
                            object.context = item.displayLink;
                        }
                        return object;
                    });
                    console.log('Finarray', finArray);
                    res.json(finArray);
                }
            });
        }
    });
});

router.get('/api/latest/imagesearch/', function(req,res){
    History.find({}).sort({when: -1}).limit(10).exec(function(err,docs){
        if(err){
            res.json({'Status': "Error"});
        }else{
            var latestArray = docs.map(function(recent){
               var recentObj = {};
               recentObj.term = recent.term;
               recentObj.when = recent.when;
               return recentObj;
            });
            res.json(latestArray);
        }
    });
});

router.get('/', function(req, res) {
    res.render('index');
});

module.exports = router;
