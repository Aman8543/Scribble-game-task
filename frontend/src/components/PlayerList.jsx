function PlayerList({ players }) {

  return (
    <div>

      <h3>Players</h3>

      {players.map((player) => (

        <div key={player.id}>
          {player.name}
        </div>

      ))}

    </div>
  );
}

export default PlayerList;