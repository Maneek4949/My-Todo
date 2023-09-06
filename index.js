import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import _ from 'lodash'

const app=express();
const port=3000;


app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended:true })); 

mongoose.connect('mongodb+srv://manojprajapati1208:PVjQl3ygzYKq62kQ@cluster0.dbpwfvy.mongodb.net/?retryWrites=true&w=majority');

const { Schema } = mongoose;

const itemSchema = new Schema({name:String})

const Item = mongoose.model('Item',itemSchema);

const defaultItem = new Item({name:"Welcome to Todolist!!"})

const List = mongoose.model("List",{name:String, items:[itemSchema]})

app.get("/",(req,res)=>{
    Item.find({}).then((data) =>{
        if (data.length === 0){
            const item = defaultItem
            item.save();
            res.redirect('/');
        }
        else{
            res.render("index.ejs",{todos:data,day:"Today"})
        }
    })    
});


app.get("/:customListName",(req,res)=>{
    const ListName = _.capitalize(req.params.customListName);
    List.findOne({name:ListName}).then((findList)=>{
        if (findList){
            res.render("index.ejs",{todos:findList.items,day:ListName})
        }
        else{
            const newList = new List({
                name:ListName,
                items: defaultItem
            })
            newList.save();
            res.redirect("/"+ListName)
        }
    })
})


app.post("/",(req,res)=>{
    const lname = req.body.list;
    const newItem = new Item({ name:req.body.todo});
    if (lname === 'Today'){
        newItem.save();
        res.redirect("/"); 
    }
    else{
        List.findOne({name:lname}).then((findList)=>{
            findList.items.push(newItem);
            findList.save();
            res.redirect("/"+lname);
        })
    }
})

app.post("/delete",async(req,res)=>{
    const checkbox = req.body.checkbox
    const lname= req.body.lname;
    if (lname === 'Today'){
        await Item.deleteOne({ _id:checkbox});
        res.redirect("/");
    }
    else{
       await List.findOneAndUpdate({name:lname},{$pull:{items:{_id:checkbox}}})
        res.redirect("/"+lname);
    }
    
})

app.listen(port,()=>{
    console.log(`Server Running on ${port}`)
})
