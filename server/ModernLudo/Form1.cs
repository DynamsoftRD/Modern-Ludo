using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;

using SuperSocket.SocketBase;
using SuperWebSocket;
using Newtonsoft.Json;
using System.Collections;

namespace ModernLudo
{
    public partial class Form1 : Form
    {
        private const int MAX_PLAYER = 4;

        private WebSocketServer appServer;
        //private WebSocketSession[] sessions = new WebSocketSession[MAX_PLAYER];
        private Player[] players = new Player[MAX_PLAYER];
        private bool isFull;
        private bool sessionFull = false;

        public Form1()
        {
            InitializeComponent();
            Init();
        }

        private void Init()
        {
            appServer = new WebSocketServer();  // create WebSocket server
            appServer.NewMessageReceived += new SessionHandler<WebSocketSession, string>(appServer_NewMessageReceived);
            appServer.NewSessionConnected += new SessionHandler<WebSocketSession>(appServer_NewSessionConnected);
            appServer.SessionClosed += new SessionHandler<WebSocketSession, SuperSocket.SocketBase.CloseReason>(appServer_SessionClosed);

            isFull = false;

            //Setup the appServer
            //if (!appServer.Setup("192.168.8.84", 2012)) //Setup with listening port
            //{
            //    MessageBox.Show("Failed to setup!");
            //    return;
            //}
            if (!appServer.Setup(2012)) //Setup with listening port
            {
                MessageBox.Show("Failed to setup!");
                return;
            }
        }

        private void appServer_NewSessionConnected(WebSocketSession session)
        {
            int len = this.players.Length;

            Player player = new Player(session, null);
            int i = 0;
            for (i = 0; i < len; ++i)
            {
                if (players[i] == null)
                {
                    player.SeatNum = i;
                    players[i] = player;
                    session.Send(JSONEncode("game", "join"));
                    break;
                }
            }
            if (i == len)
            { // 4 people playing
                session.Send(JSONEncode("room", "full"));
                this.sessionFull = true;
            }
        }

        private void appServer_NewMessageReceived(WebSocketSession session, string message)
        {
            if (message.Contains("player"))
            {
                Dictionary<string, string> obj = JsonConvert.DeserializeObject<Dictionary<string, string>>(message);
                String name = obj["player"];
                // add player name
                foreach (Player player in players)
                {
                    if (player != null && player.Session.SessionID.Equals(session.SessionID))
                    {
                        player.Name = name;
                        break;
                    }
                }
                // show players
                {
                    Player player = null;
                    int i;
                    for (i = 0; i < MAX_PLAYER; i++)
                    {
                        player = players[i];
                        if (player != null)
                            if (player.Name != null)
                                player.SendPlayers(players);
                            else
                            {
                                break;
                            }
                        else
                        {
                            break;
                        }
                    }
                    if (i == MAX_PLAYER)
                    {
                        this.isFull = true;
                        Game_Start();
                    }
                }
            }
            else
            {
                if (message.Contains("diceValue"))
                {

                    Dictionary<string, string> obj = JsonConvert.DeserializeObject<Dictionary<string, string>>(message);
                    String name = obj["diceValue"];
                    UpdateAllStatus(session, message);
                }
                else if (message.Contains("planeclicked"))//the player moved a plane
                {
                    UpdateAllStatus(session, message);
                }
                else if (message.Contains("NotifyNext"))
                {
                    NotifyNext(session);
                }
            }
        }

        void appServer_SessionClosed(WebSocketSession session, SuperSocket.SocketBase.CloseReason value)
        {
            for (int i = 0; i < MAX_PLAYER; ++i)
            {
                if (players[i] != null && players[i].Session.SessionID.Equals(session.SessionID))
                {
                    players[i] = null;
                    this.isFull = false;
                    break;
                }
            }
        }

        private void buttonStart_Click(object sender, EventArgs e)
        {
            websocket_start();
        }

        private void websocket_start()
        {
            //Try to start the appServer
            if (!appServer.Start())
            {
                MessageBox.Show("Failed to start!");
                return;
            }

            buttonStart.Enabled = false;
            buttonStop.Enabled = true;
        }

        private void websocket_stop()
        {
            //Stop the appServer
            appServer.Stop();

            buttonStart.Enabled = true;
            buttonStop.Enabled = false;
        }

        private void NotifyNext(WebSocketSession session)
        {
            int len = this.players.Length;
            for (int i = 0; i < len; ++i)
            {
                if (players[i].Session.SessionID.Equals(session.SessionID))
                {
                    if ((i + 1) == MAX_PLAYER)
                    {
                        string msg = JSONEncode("game", "move$" + players[0].Name);
                        players[0].Session.Send(msg);
                    }
                    else
                    {
                        string msg = JSONEncode("game", "move$" + players[i + 1].Name);
                        players[i + 1].Session.Send(msg);
                    }
                }
            }
        }

        private void UpdateAllStatus(WebSocketSession session, string message)
        {
            //message = JSONEncode("step", "6");
            foreach (Player player in this.players)
            {
                if (player != null && !player.Session.SessionID.Equals(session.SessionID))
                {
                    player.Session.Send(message);
                }
            }
        }

        private void Reset()
        {
            isFull = false;

            int len = this.players.Length;
            for (int i = 0; i < len; ++i)
            {
                players[i] = null;
            }
        }

        private void SendMsgToAllSessions(string msg)
        {
            foreach (Player player in this.players)
            {
                if (player != null)
                    player.Session.Send(msg);
            }
        }

        private void Game_Join()
        {

        }

        private void Game_Start()
        {
            String msg = JSONEncode("game", "start");
            SendMsgToAllSessions(msg);
            msg = JSONEncode("game", "move$" + players[0].Name);
            players[0].Session.Send(msg);
        }

        public static String JSONEncode(String key, String value)
        {
            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);
            using (JsonWriter writer = new JsonTextWriter(sw))
            {
                writer.Formatting = Formatting.Indented;
                writer.WriteStartObject();
                writer.WritePropertyName(key);
                writer.WriteValue(value);
                writer.WriteEndObject();
            }

            return sw.ToString();
        }

        private void buttonStop_Click(object sender, EventArgs e)
        {
            websocket_stop();
        }
    }

    public class Player
    {
        public WebSocketSession Session { get; set; }
        public string Name { get; set; }
        public ArrayList Players = new ArrayList();
        public int SeatNum { get; set; }
        public Player(WebSocketSession session, string name)
        {
            this.Session = session;
            this.Name = name;
        }
        public void SendPlayers(Player[] players)
        {
            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);
            using (JsonWriter writer = new JsonTextWriter(sw))
            {
                writer.Formatting = Formatting.Indented;
                writer.WriteStartObject();
                writer.WritePropertyName("players");
                writer.WriteStartArray();
                foreach (Player player in players)
                {
                    if (player != null)
                        if (player.Name != null)
                        {
                            writer.WriteValue(player.SeatNum + "$" + player.Name);
                        }
                }
                writer.WriteEndArray();
                writer.WriteEndObject();
            }
            Session.Send(sw.ToString());
        }
    }
}
