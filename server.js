var express = require('express');
var app = express();
app.use(express.bodyParser());
var nohm = require('nohm').Nohm;
var redis = require("redis").createClient();
console.log("the server is running")


redis.on("connect", function(){
  nohm.setClient(redis);
  console.log("Nohm Connected to Redis Client");
})


var port = process.env.PORT || 3000;

var Restaurant = nohm.model('Restaurant', {
  properties: {
    name: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    ratingTotal: {
      // type: 'integer',
      type: function incRatingBy(value, key, old){
        return old + value
      }
    },
    ratingCount: {
      type: function incRatingBy(value, key, old){
        return old + 1
      }
      // defaultValue: 0
    },
  },
  methods: {
    getAvgRating: function(){
      return this.p('ratingTotal')/this.p('ratingCount')
    }
  }  
});

var listResaurants = function (req, res) {
    User.find(function (err, ids) {
    var restaurants = [];
    var len = ids.length;
    var count = 0;
    if(ids.length === 0) {
      res.send([]);

    } else {
      ids.forEach(function (id) {
        var user = new User();
        user.load(id, function (err, props) {
          users.push({id: this.id, firstname: props.firstname, lastname: props.lastname, age: props.age});
          if (++count === len) {
            res.send(users);
          }
        });
      });
    }
  });
}

// var listUsers = function (req, res) {
//     User.find(function (err, ids) {
//     var users = [];
//     var len = ids.length;
//     var count = 0;
//     console.log(ids, 'ids');
//     if(ids.length === 0) {
//       res.send([]);

//     } else {
//       ids.forEach(function (id) {
//         var user = new User();
//         user.load(id, function (err, props) {
//           users.push({id: this.id, firstname: props.firstname, lastname: props.lastname, age: props.age});
//           if (++count === len) {
//             res.send(users);
//           }
//         });
//       });
//     }
//   });
// }

var restaurantDetails = function (req, res) {
  Restaurant.load(req.params.id, function (err, properties) {
    if(err) {
      res.send(404);
    } else {
      res.send(properties);
    }
  });
};

var deleteRestaurant = function (req, res) {
  var restaurant = new Restaurant();
  restaurant.id = req.params.id;
  restaurant.remove(function (err) {
    res.send(204);
  });
}

var createRestaurant = function (req, res) {
  var restaurant = new Restaurant();
  restaurant.p(req.body);
  restaurant.save(function (err) {
    if(err){
      console.log(err)
    }
    else{
      console.log("saved Restaurant")
    }
  });
}

var updateRestaurant = function (req, res) {
  var restaurant = new Restaurant();
  restaurant.id = req.params.id;
  restaurant.p(req.body);
  restaurant.save(function (err) {
    res.send(user.allProperties(true));
  });
}


app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Content-Type", "application/json");
  next();
});
app.get('/restaurants', listResaurants);
app.get('/users/:id', restaurantDetails);
// app.del('/users/:id', RestaurantDetails);
app.post('/users', createRestaurant);
app.put('/users/:id', updateRestaurant);

app.listen(port);
