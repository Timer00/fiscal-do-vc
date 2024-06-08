const dotenv = require('dotenv');
const {Client, Events, GatewayIntentBits} = require('discord.js');

dotenv.config();

const MY_USER_ID = process.env.MY_USER_ID;

// Create a new client instance
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]});

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Helper function to send a message to a user
async function sendMessageToUser(userId, message) {
    try {
        const user = await client.users.fetch(userId);
        await user.send(message);
    } catch (error) {
        console.error('Error sending DM:', error);
    }
}

// Function to get voice channel details
function getVoiceChannelDetails(channel) {
    if (!channel) return { userCount: 0, usernames: [] };

    const members = channel.members.map(member => member.user.tag);
    return { userCount: channel.members.size, usernames: members };
}

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Check if someone joined the voice channel
    if (!oldState.channelId && newState.channelId) {
        const user = newState.member.user;
        if (user.id === MY_USER_ID) return;
        const channelDetails = getVoiceChannelDetails(newState.channel);

        const message = `${user.tag} joined ${newState.channel.name}. Users in channel: ${channelDetails.userCount} (${channelDetails.usernames.join(', ')})`;
        console.log(message);

        await sendMessageToUser(MY_USER_ID, message);
    }

    // Check if someone left the voice channel
    if (oldState.channelId && !newState.channelId) {
        const user = oldState.member.user;
        if (user.id === MY_USER_ID) return;
        const channel = oldState.guild.channels.cache.get(oldState.channelId);
        const channelDetails = getVoiceChannelDetails(channel);

        const message = `${user.tag} left ${channel.name}. Users remaining in channel: ${channelDetails.userCount} (${channelDetails.usernames.join(', ')})`;
        console.log(message);

        await sendMessageToUser(MY_USER_ID, message);
    }
});

// Log in to Discord with your client's token
void client.login(process.env.DISCORD_TOKEN);
