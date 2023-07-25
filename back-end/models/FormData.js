
const formDataSchema = new mongoose.Schema({
  title: String,
  opinion: String,
  name: String,
  mobile: {
    type: Number,
    minlength: 10,
  },
  did: Boolean,
});

const FormData = mongoose.model('FormData', formDataSchema);

module.exports = FormData;