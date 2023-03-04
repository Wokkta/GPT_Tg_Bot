const { Telegraf } = require('telegraf');

const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");
const { it } = require('node:test');

require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);






async function testApi(text){
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 2000
    });
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

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => {
  const helpMessage = `This is a help message. Here are the available commands:\n\n/start - start the bot\n/help - display this help message\n/img - toggle image generation mode\n\nSend any other message to get a response from the AI model.`;
  ctx.reply(helpMessage);
});

bot.hears('hi', (ctx) => ctx.reply('Hey there'));

let model = 1;

bot.hears("img", async (ctx) => {
  model = !model;
  if (model) {
    await ctx.reply('Image generation mode is ON.');
  } else {
    await ctx.reply('Image generation mode is OFF.');
  }
});

bot.on('message', async (ctx) => {

  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  const result = await testApi(text);
  
  if (model) {
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/generations',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      data: {
        'model': 'image-alpha-001',
        'prompt': text,
        'num_images': 1,
        'size': '1024x1024',
        'response_format': 'url'
      }
    });
    const photoUrl = response.data.data[0].url;
    await ctx.replyWithPhoto({ url: photoUrl }, { caption: result });
  } else {
    await ctx.reply(result);
  }
  
});




bot.launch();


