
const mongoose=require('mongoose');
const schema=mongoose.Schema;
const bookSchema=new schema({
  uploadedBy : String,
  name:String,
  price :Number,
  coverImage : String,
  category: String
});


Book=mongoose.model('Book',bookSchema);

module.exports=Book;