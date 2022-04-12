const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-angela:PasswordTest123@cluster0.opgnw.mongodb.net/todolistDB", {useNewURLParser: true})

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

app.set("view engine", "ejs");


const itemsSchema ={
  name : String,
};

const Item = mongoose.model (
  "Item",
  itemsSchema,
);


const item1 = new Item ({
  name: "Welcome to your todoList!"

})
const  item2 = new Item ({
  name: "Hit the + button to add new a new item."

})
const item3 = new Item ({
  name: "<-- Hit this to delete and item."

})
const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)




app.get("/", function (req, res) {
  
  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err)
        }else{
          console.log("items were succesfully added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItems: foundItems});
    }

  });
});


app.get("/:listType", function (req, res){
  const customListName = _.capitalize(req.params.listType);

  List.findOne({name:customListName}, function(err, foundList){

    if(!err) {
      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)
  }else{
res.render("list", {listTitle: foundList.name, newItems: foundList.items}) 
}
}
});

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

if (listName === "Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}, function (err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName)
  });
};

});


app.post("/delete", function (req, res) {

const checkedItemID = req.body.checkbox;
const listName = req.body.listName; 

if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemID, function(err){
  if (!err){
    console.log ("item has been removed successfully");
    res.redirect("/");
  }
  })

}else{

  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    };
  });

};
});


app.get("/about", function (req, res) {
res.render("about")



});

app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
