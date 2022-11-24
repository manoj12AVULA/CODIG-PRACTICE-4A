const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let dataBase = null;

const initializingOfDb = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error :${e.message}`);
    process.exit(1);
  }
};

initializingOfDb();

let changeValuesToCm = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

app.get("/players/", async (request, response) => {
  const query = ` 
  SELECT
    * 
  FROM 
    cricket_team;`;
  const playersDetails = await dataBase.all(query);
  response.send(playersDetails.map((eachItem) => changeValuesToCm(eachItem)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = ` 
    SELECT * 
    FROM cricket_team 
    WHERE player_id = ${playerId}
    ;`;
  const playerDetails = await dataBase.get(sqlQuery);
  response.send(changeValuesToCm(playerDetails));
});

app.post("/players/", async (request, response) => {
  const body = request.body;
  const { playerName, jerseyNumber, role } = body;
  const createQuery = ` 
    INSERT INTO 
        cricket_team (player_name , jersey_number , role) 
    VALUES 
        ('${playerName} ', ${jersey_number} ,'${role}');`;

  const createPlayer = await dataBase.run(createQuery);
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;

  const updateQuery = ` 
  UPDATE 
    cricket_team 
  SET 
    player_name : '${playerName}', 
    jersey_number : ${jerseyNumber},
    role : '${role}'
  ;`;
  await dataBase.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete(" /players/:playerId/", async (request, response) => {
  const { pathId } = request.params;

  const deleteQuery = ` 
    DELETE FROM 
        cricket_team 
    WHERE 
        player_id = ${pathId}
    `;
  await dataBase.run(deleteQuery);
  response.send("Player Removed");
});
