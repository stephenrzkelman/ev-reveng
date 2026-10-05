import { battleLog as t8g1 } from "./top8-match/game1";
import { battleLog as t8g2 } from "./top8-match/game2";
import { resetTeam, totalDefensiveSpreadCount } from "../../reveng";
import { joeTeam } from "./joe-ots";
import { lorenzoTeam } from "./top8-match/top8-opp-ots";

for(const event of t8g1){
    event();
}
resetTeam(joeTeam);
resetTeam(lorenzoTeam);
for(const event of t8g2){
    event();
}
resetTeam(joeTeam);

console.log("=======================================================================================");
console.log("=======================================================================================");
for(const [_, pokemon] of Object.entries(joeTeam)) {
    console.log(`${pokemon.possibleOffensiveInvestment.atk.size} possible atk EVs for ${pokemon.pokemon.name}`);
    console.log(`${pokemon.possibleOffensiveInvestment.spa.size} possible spa EVs for ${pokemon.pokemon.name}`);
    console.log(`${totalDefensiveSpreadCount(pokemon, 'def')} possible relevant def spreads for ${pokemon.pokemon.name}`);
    console.log(`${totalDefensiveSpreadCount(pokemon, 'spd')} possible relevant spd spreads for ${pokemon.pokemon.name}`);
    console.log("=======================================================================================");
}
