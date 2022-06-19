const { Intents, Client, MessageEmbed } = require("discord.js");
const gd = require("gamedig");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { load } = require("js-yaml");
const { readFileSync } = require("fs");
const config = load(readFileSync("./config.yml"));

let timeplayed = {};
let embed;

client.on("ready", () => {
    getInfo();
    setInterval(getInfo, 1 * 60 * 1000);
    setTimeout(post, 5000);
    setInterval(post, (5 * 60 * 1000) + 1000);
});

client.login(config.token);

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + "h " + minutes + "m";
}

function getInfo() {
    gd.query({
        type: "minecraft",
        host: config.ip,
        port: config.port,
        maxAttempts: 3
    }).then((state) => {
        let temp = {};
        for (i = 0; i < state.players.length; i++) {
            let name = state.players[i]["name"];
            if (timeplayed[name] != undefined) {
                temp[name] = timeplayed[name];
            }
        }
        timeplayed = temp;
        embed = new MessageEmbed().setColor(0x3399FF)
        if (state.players.length >= 1) {
            let max = 0;
            for (i = 0; i < state.players.length; i++) {
                if (state.players[i]["name"] == "") break;
                if (state.players[i]["name"].length > max) max = state.players[i]["name"].length;
            }
            str = "\`\`\`";
            for (i = 0; i < state.raw.vanilla.players.length; i++) {
                let name = state.raw.vanilla.players[i]["name"];
                if (name == "") break;
                time = timeplayed[name];
                if (time == undefined) {
                    time = 0;
                    timeplayed[name] = time;
                } else {
                    time = time + 1 * 60 * 1000;
                    timeplayed[name] = time;
                }
                str = str + "\n" + name.padEnd(max+2," ") + "[" + msToTime(time) + "]";
            }
            str = str.substr(0,1000);
            str = str + "\n\`\`\`";
            
            embed.setTitle("Status: Online")
                .addField(`Players Online: ${state.players.length.toString()}/${state.maxplayers.toString()}`, str);
        }
        else {
            embed.setTitle("Status: Online")
        	    .setDescription("No players online")
        }
    }).catch((error) => {
        console.log(error)
        embed = new MessageEmbed()
            .setColor(0x3399FF)
            .setTitle("Status: Offline")
    });
}

function post() {
    client.channels.cache.get(config.channel).send({ embeds: [embed]});
}