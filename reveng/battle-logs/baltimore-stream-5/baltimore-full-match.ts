import { resetForNextBattle } from "../../reveng";
import { battleLog1 } from "./baltimore-battlelog1";
import { battleLog2 } from "./baltimore-battlelog2";
import { team1, team2, boardState } from "./baltimore-info";


for(const event of battleLog1){
    event();
}
resetForNextBattle(team1, team2, boardState)
for(const event of battleLog2){
    event();
}
// additional debugging
console.log("Kommo-o has ", team2['Kommo-o'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Sneasler has ", team2['Sneasler'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Rillaboom has ", team2['Rilla'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Incineroar has ", team2['Incin'].possibleDefensiveSpreads.size, " possible defensive spreads");
for(const ev of team2.Rilla.possibleAttackEvs){
    console.log(ev);
}
