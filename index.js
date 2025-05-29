/**


 Copyright (C) 2025.
 Licensed under the  GPL-3.0 License;
 You may not sell this script.
 Dark-DEv like that
 * @version 3.0.0
 **/


const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
jidNormalizedUser,
getContentType,
fetchLatestBaileysVersion,
Browsers
} = require('@whiskeysockets/baileys')


const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./config')
const rankCommand = require('./plugins/rank')
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms,downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const { tmpdir } = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX

const ownerNumber = ['22603582906']

//===================SESSION-AUTH============================
// Ensure the sessions directory exists
if (!fs.existsSync(__dirname + '/sessions')) {
    fs.mkdirSync(__dirname + '/sessions');
    console.log("Created sessions directory.");
}

// Check if creds.json exists, if not, try to download from Mega
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    console.log("Local session file not found. Attempting to download from Mega...");
    if (!config.SESSION_ID) {
        console.error('SESSION_ID environment variable is missing! Cannot download session.');
        process.exit(1); // Exit if SESSION_ID is not set
    } else {
        let megaUrlPart = '';
        let fullMegaUrl = '';

        // Handle both potential prefixes
        if (config.SESSION_ID.startsWith("GoJo-xmd~")) {
            megaUrlPart = config.SESSION_ID.substring(10); // Remove "GoJo-xmd~"
        } else if (config.SESSION_ID.startsWith("GoJo~")) {
            megaUrlPart = config.SESSION_ID.substring(5); // Remove "GoJo~"
        } else {
            console.error('Invalid SESSION_ID format. Expected prefix "GoJo-xmd~" or "GoJo~".');
            process.exit(1);
        }

        // Validate the extracted part (should contain file ID and key)
        if (!megaUrlPart || !megaUrlPart.includes('#')) {
             console.error(`Invalid SESSION_ID format after prefix removal: "${megaUrlPart}". It should contain FILE_ID#KEY.`);
             process.exit(1);
        }

        fullMegaUrl = `https://mega.nz/file/${megaUrlPart}`;
        console.log(`Attempting to download session from reconstructed URL: ${fullMegaUrl}`);

        try {
            const filer = File.fromURL(fullMegaUrl);

            filer.download((err, data) => {
                if (err) {
                    console.error("Error downloading session from Mega:", err);
                    console.error("Please ensure the SESSION_ID is correct and the Mega link is valid.");
                    process.exit(1);
                } else {
                    fs.writeFile(__dirname + '/sessions/creds.json', data, (writeErr) => {
                        if (writeErr) {
                            console.error("Error writing downloaded session file:", writeErr);
                            process.exit(1);
                        } else {
                            console.log("SESSION DOWNLOADED AND SAVED SUCCESSFULLY ✅");
                            // It might be necessary to restart the process or call connectToWA() here
                            // depending on the application flow.
                            // For simplicity, we assume the process will be restarted or connection
                            // is handled after this block.
                        }
                    });
                }
            });
        } catch (urlError) {
            console.error("Error processing Mega URL from SESSION_ID:", urlError);
            console.error(`Failed to process URL: ${fullMegaUrl}. Check SESSION_ID format.`);
            process.exit(1);
        }
    }
} else {
    console.log("Local session file found. Skipping Mega download.");
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;


async function connectToWA() {
console.log("CONNECTING GoJo-xmd 🧬...");
const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
var { version } = await fetchLatestBaileysVersion()

const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
        })

conn.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
console.log("Connection closed due to error, reconnecting...");
connectToWA()
} else {
    console.log("Connection closed: Logged Out. Please delete session and scan QR again.");
    // Optionally remove the session file here
    // fs.unlinkSync(__dirname + '/sessions/creds.json');
    process.exit(1); // Exit if logged out
}
} else if (connection === 'open') {
console.log('♻️ INSTALLING PLUGINS FILES PLEASE WAIT... 🪄')
const pluginPath = path.join(__dirname, "./plugins/"); // Ensure correct path joining
fs.readdirSync(pluginPath).forEach((plugin) => {
if (path.extname(plugin).toLowerCase() == ".js") {
try {
    require(path.join(pluginPath, plugin));
} catch (e) {
    console.error(`Error loading plugin ${plugin}:`, e);
    // Optionally skip the plugin or handle the error
}
}
});
console.log('PLUGINS FILES INSTALL SUCCESSFULLY ✅')
console.log('GoJo-xmd CONNECTED TO WHATSAPP ENJOY ✅')

let up = `*╭──────────────●●►*
> *➺ GoJo-xmd ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʏ ᴛʏᴘᴇ .ᴍᴇɴᴜ ᴛᴏ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ ᴄʀᴇᴀᴛᴇᴅ ʙʏ Dark-DEv ✅*

> *❁ᴊᴏɪɴ ᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ ғᴏʀ ᴜᴘᴅᴀᴛᴇs 

*https://chat.whatsapp.com/IbqroBdjYR45Ep0wPNzJoQ*

*YOUR BOT ACTIVE NOW ENJOY♥️🪄*\n\n*PREFIX: ${prefix}*

*╰──────────────●●►*`;
conn.sendMessage(conn.user.id, { image: { url: config.MENU_IMG }, caption: up }).catch(e => console.error("Error sending welcome message:", e));

}
})
conn.ev.on('creds.update', saveCreds)

//=============readstatus=======

conn.ev.on('messages.upsert', async(mek) => {
    try { // Add a try-catch block for the entire handler
        mek = mek.messages[0]
        if (!mek.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true"){
            await conn.readMessages([mek.key])
        }
        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'Sin Nombre'
        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => { console.error("Error fetching group metadata:", e); return null; }) : ''
        const groupName = isGroup && groupMetadata ? groupMetadata.subject : ''
        const participants = isGroup && groupMetadata ? await groupMetadata.participants : ''
        const groupAdmins = isGroup && participants ? await getGroupAdmins(participants) : ''
        const isBotAdmins = isGroup && groupAdmins ? groupAdmins.includes(botNumber2) : false
        const isAdmins = isGroup && groupAdmins ? groupAdmins.includes(sender) : false
        const isReact = m.message?.reactionMessage ? true : false // Safer access
        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek })
        }

        conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            try { // Add try-catch for sendFileUrl
                let mime = '';
                let res = await axios.head(url)
                mime = res.headers['content-type']
                if (!mime) throw new Error("Could not determine mime type");

                if (mime.split("/")[1] === "gif") {
                    return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
                }
                let type = mime.split("/")[0] + "Message"
                if (mime === "application/pdf") {
                    return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
                }
                if (mime.split("/")[0] === "image") {
                    return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
                }
                if (mime.split("/")[0] === "video") {
                    return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
                }
                if (mime.split("/")[0] === "audio") {
                    return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
                }
            } catch (e) {
                console.error("Error in sendFileUrl:", e);
                // Optionally notify user about the error
                // reply("Sorry, I couldn't send the file from the URL.");
            }
        }

        //================ownerreact==============
        // Simplified owner reacts
        if (ownerNumber.includes(senderNumber) && !isReact) {
            const ownerReactions = ["👑", "🦋", "🎀"];
            m.react(ownerReactions[Math.floor(Math.random() * ownerReactions.length)]);
        }

        //==========================public react===============//
        // Auto React
        if (!isReact && !ownerNumber.includes(senderNumber) && senderNumber !== botNumber) { // Avoid reacting to owner and self
            if (config.AUTO_REACT === 'true') {
                const reactions = ['😊', '👍', '😂', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖', '❤️', '✨', '✔️']; // Shorter, more common list
                m.react(reactions[Math.floor(Math.random() * reactions.length)]);
            }
        }

        // --- Command Handling --- (Should be placed after all variable definitions)
        if (isCmd) {
            // Example: Load and execute command from plugins
            const commandPath = path.join(__dirname, './plugins', `${command}.js`);
            if (fs.existsSync(commandPath)) {
                try {
                    const commandModule = require(commandPath);
                    if (typeof commandModule.run === 'function') {
                        await commandModule.run({ conn, m, args, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner, isBotAdmins, isAdmins, reply, groupMetadata, participants, groupAdmins });
                    } else {
                        console.log(`Command ${command} exists but has no run function.`);
                    }
                } catch (e) {
                    console.error(`Error executing command ${command}:`, e);
                    reply(`An error occurred while running the command: ${command}`);
                }
            } else {
                // Optional: Notify if command not found
                // reply(`Command not found: ${command}`);
            }
        }
        // --- End Command Handling ---

    } catch (err) {
        console.error("Error in messages.upsert handler:", err);
        // Avoid crashing the bot on unhandled errors in message processing
    }
});

// Start the connection
connectToWA().catch(err => console.error("Failed to connect to WhatsApp:", err));

// Basic Express endpoint (optional)
app.get('/', (req, res) => {
  res.send('GoJo-xmd Bot is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
