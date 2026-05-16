import express from "express";

const app = express();
app.use(express.json());

const validDice = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20
};

const validRollModes = ["normal", "advantage", "disadvantage"];

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Dice Roller API is running."
  });
});

app.post("/roll-dice", (req, res) => {
  const {
    die,
    diceCount = 1,
    modifier = 0,
    rollMode = "normal"
  } = req.body;

  if (!validDice[die]) {
    return res.status(400).json({
      error: "Ungueltiger Wuerfeltyp. Erlaubt sind d4, d6, d8, d10, d12 und d20."
    });
  }

  if (!Number.isInteger(diceCount) || diceCount < 1 || diceCount > 20) {
    return res.status(400).json({
      error: "diceCount muss eine ganze Zahl zwischen 1 und 20 sein."
    });
  }

  if (!Number.isInteger(modifier)) {
    return res.status(400).json({
      error: "modifier muss eine ganze Zahl sein."
    });
  }

  if (!validRollModes.includes(rollMode)) {
    return res.status(400).json({
      error: "rollMode muss normal, advantage oder disadvantage sein."
    });
  }

  const sides = validDice[die];

  if (rollMode === "advantage" || rollMode === "disadvantage") {
    const firstRoll = rollDie(sides);
    const secondRoll = rollDie(sides);

    const keptRoll = rollMode === "advantage"
      ? Math.max(firstRoll, secondRoll)
      : Math.min(firstRoll, secondRoll);

    const discardedRoll = rollMode === "advantage"
      ? Math.min(firstRoll, secondRoll)
      : Math.max(firstRoll, secondRoll);

    const total = keptRoll + modifier;

    return res.json({
      die,
      diceCount: 1,
      rolls: [firstRoll, secondRoll],
      modifier,
      total,
      rollMode,
      keptRoll,
      discardedRoll,
      message: `${die} mit ${rollMode} gewuerfelt. Ergebnis: ${total}.`
    });
  }

  const rolls = [];

  for (let i = 0; i < diceCount; i++) {
    rolls.push(rollDie(sides));
  }

  const rollTotal = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = rollTotal + modifier;

  res.json({
    die,
    diceCount,
    rolls,
    modifier,
    total,
    rollMode,
    message: `${diceCount}${die} gewuerfelt. Ergebnis: ${total}.`
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Dice Roller API running on port ${port}`);
});
