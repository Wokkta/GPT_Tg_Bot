const { Telegraf } = require('telegraf')
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function testApi(text){
try {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    max_tokens: 3000
  });
  console.log("test /n")
  console.log(completion.data.choices[0].text);
  console.log("test /n")
  return completion.data.choices[0].text
} catch (error) {
  if (error.response) {
    console.log(error.response.status);
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
} 

}
let model = 1
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))

bot.help((ctx) => ctx.reply('Send me a sticker'))

bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.hears("img",(ctx)=>{model = !model})

bot.on('message',async (ctx) => {
    const result = await testApi(ctx.message.text)
    ctx.reply(result)
    
  })
bot.launch()

//IT'S ALIVE