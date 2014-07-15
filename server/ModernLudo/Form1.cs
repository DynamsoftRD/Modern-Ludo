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
            if (this.isFull)
            {
                session.Send(JSONEncode("room", "full"));
                return;
            }

            int len = this.players.Length;

            Player player = new Player(session, null);
            for (int i = 0; i < len; ++i)
            {
                if (players[i] == null)
                {
                    player.SeatNum = i;
                    players[i] = player;
                    session.Send(JSONEncode("game", "join"));
                    if (i == (MAX_PLAYER - 1))
                    {
                        this.isFull = true;
                        //Game_Start();
                    }
                    break;
                }
            }
        }

        private void appServer_NewMessageReceived(WebSocketSession session, string message)
        {
            if (message.Contains("player"))
            {
                Dictionary<string, string> obj = JsonConvert.DeserializeObject<Dictionary<string, string>>(message);
                String name = obj["player"];

                // collect player names
                int len = players.Length;

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
                    for (int i = 0; i < MAX_PLAYER; ++i)
                    {
                        player = players[i];
                        if (player != null)
                            player.LoadPlayers(players);
                    }
       
                }

                // if full, start game
                if (this.isFull)
                {
                    Game_Start();
                }
            }
            else
            {
                UpdateAllStatus(session, message);
                NotifyNext(session);
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
                        players[0].Session.Send(JSONEncode("game", "move"));
                    }
                    else
                    {
                        players[i + 1].Session.Send(JSONEncode("game", "move"));
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
            // init players


            // start game
            String msg = JSONEncode("game", "start");
            SendMsgToAllSessions(msg);
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
        public string Name {get; set;}
        public ArrayList Players = new ArrayList();
        public int SeatNum { get; set; }

        public Player(WebSocketSession session, string name)
        {
            this.Session = session;
            this.Name = name;
        }

        public void ShowPlayers()
        {
            string msg = JSONEncode("players", Players);
            Session.Send(msg);
        }

        public static String JSONEncode(String key, ArrayList values)
        {
            StringBuilder sb = new StringBuilder();
            StringWriter sw = new StringWriter(sb);
            using (JsonWriter writer = new JsonTextWriter(sw))
            {
                writer.Formatting = Formatting.Indented;
                writer.WriteStartObject();
                writer.WritePropertyName(key);
                writer.WriteStartArray();
                foreach (Player value in values)
                {
                    writer.WriteValue(value.Name);
                }
                writer.WriteEndArray();
                writer.WriteEndObject();
            }

            return sw.ToString();
        }

        public void LoadPlayers(Player[] players)
        {
            Players.Clear();

            int totalPlayers = players.Length;
            int len = totalPlayers - 1;
            int i = SeatNum;
            bool isDirty = false;
            do
            {
                i += 1;
                if (i == totalPlayers)
                    i = 0;

                if (players[i] != null)
                {
                    Players.Add(players[i]);
                    isDirty = true;
                } 

                len -= 1;
            } while (len != 0);

            if (isDirty)
                ShowPlayers();
        }
    }
}
