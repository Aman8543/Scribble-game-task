function ScoreBoard({ players }) {

  return (
    <div>

      <h3>Score Board</h3>

      {players.map((player) => (

        <div key={player.id}>
          {player.name} : {player.score}
        </div>

      ))}

    </div>
  );
}

export default ScoreBoard;
