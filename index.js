const PORT = 8000
const axios = require("axios").default
const express = require("express")
const cors = require("cors")
require('dotenv').config()
const app = express()
const path = require('path')
const cron = require('node-cron');



app.use(cors())

app.get('/word', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://random-words5.p.rapidapi.com/getMultipleRandom',
        params: {count: '5', wordLength: '5'},
        headers: {
            'x-rapidapi-host': 'random-words5.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        }
    }
    axios.request(options).then((response) => {
        console.log(response.data)
        res.json(response.data[0])
    }).catch((error) => {
        console.error(error)
    })
})


app.get('/check', (req, res) => {
    const word = req.query.word

    const options = {
        method: 'GET',
        url: 'https://twinword-word-graph-dictionary.p.rapidapi.com/association/',
        params: {entry: word},
        headers: {
            'x-rapidapi-host': 'twinword-word-graph-dictionary.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        }
    }
    axios.request(options).then((response) => {
        console.log(response.data)
        res.json(response.data.result_msg)
    }).catch((error) => {
        console.error(error)
    })
})


//initialize wordle once every day at midnight EST Time
let wordle

const getWordle = () => {
    fetch('http://localhost:8000/word')
        .then(response => response.json())
        .then(json => {
            wordle = json.toUpperCase()
        })
        .catch(err => console.log(err))
}

//cron job for getting the wordle
var task = cron.schedule('00 00 * * *', () => {
    console.log('Getting new Wordle');
    getWordle()
}, 
{
scheduled: false,
//see here for time zones: https://raw.githubusercontent.com/node-cron/tz-offset/master/generated/offsets.json
    timezone: "America/New_York"
});

// start method is called to start the above defined cron job
task.start();

//you can also use a public folder here to host 
app.use(express.static(path.join(__dirname, '/')))

//let test = "test successful"

app.get('/', (req, res) => {

   res.sendFile(__dirname, '/index.html')

})

//updating wordle 
app.get('/setwordle', function(req, res){
  res.send(wordle)
 })



app.listen(PORT, () => console.log('Server running on port ' + PORT))
