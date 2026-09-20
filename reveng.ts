import {calculateChampions} from './calc/src/mechanics/champions';
import { Generations } from "./calc/src/data";
import { Dex, StatsTable } from '@pkmn/dex';
import { Pokemon } from "./calc/src";
import { Move } from './calc/src';
import { Field } from "./calc/src";
import { Weather } from '@pkmn/dex';
import type * as I from './calc/src/data';
import { calcStat } from './calc/src';

const gen = Generations.get(0);
const boardState = new Field(
    {
        gameType: 'Doubles'
    }
);
const allPotentialDefensiveSpreads = new Set<StatsTable<number>>();
for(let hp = 0; hp <= 32; hp += 1){
    for(let def = 0; def <= Math.min(32, 66-(hp)); def += 1){
        for(let spd = 0; spd <= Math.min(32, 66-(hp+def)); spd += 1){
            allPotentialDefensiveSpreads.add({hp: hp, atk: 0, def: def, spa: 0, spd: spd, spe: 0});
        }
    }
};
console.log(`${allPotentialDefensiveSpreads.size} total possible defensive spreads`);

class AugmentedMon{
    pokemon: Pokemon;
    possibleDefensiveSpreads: Map<StatsTable<number>, Set<number>>;
    possibleAttackEvs: Set<number>;
    constructor(pokemon: Pokemon, possibleDefensiveSpreads?: Map<StatsTable<number>, Set<number>>, possibleAttackEvs?: Set<number>){
        this.pokemon = pokemon;
        this.possibleDefensiveSpreads = possibleDefensiveSpreads || new Map<StatsTable<number>, Set<number>>();
        this.possibleAttackEvs = possibleAttackEvs || new Set<number>();
        if(this.possibleDefensiveSpreads.size === 0) {
            for(const evSpread of allPotentialDefensiveSpreads){
                pokemon.evs = evSpread;
                this.possibleDefensiveSpreads.set(evSpread, new Set<number>([
                    calcStat(gen, 'hp', pokemon.species.baseStats.hp, pokemon.ivs.hp, pokemon.evs.hp, pokemon.level, pokemon.nature)
                ]));
            }
        }
        if(this.possibleAttackEvs.size === 0){
            for(let possibleAttackEv = 0; possibleAttackEv <= 32; possibleAttackEv += 1){
                this.possibleAttackEvs.add(possibleAttackEv);
            }
        }
    }
}

function getPossibleResHps(move: Move, attacker: Pokemon, defender: Pokemon, targetHpPct: number, debug?: boolean){
    var totalDefenderHp = calcStat(gen, 'hp', defender.species.baseStats.hp, defender.ivs.hp, defender.evs.hp, defender.level, defender.nature);
    var result = calculateChampions(
        gen,
        attacker,
        defender,
        move,
        boardState
    );
    var prevDefenderHp = result.defender.curHP();
    var damageRolls = result.damage;
    if(debug){
        console.log(attacker.evs, defender.evs, damageRolls);
    }
    let validResHps = new Set<number>();
    if (Array.isArray(damageRolls) && damageRolls.every((roll) => typeof roll === 'number')){
        var possibleResHpsRaw = damageRolls.map((roll)=>Math.max(0, prevDefenderHp-roll));
        var possibleResHpsPct = possibleResHpsRaw.map((hp) => hp/totalDefenderHp*100);
        possibleResHpsPct.forEach((percent, index) => {
            if(
                ((Math.floor(percent) === targetHpPct) || 
                (targetHpPct === 1 && Math.ceil(percent) === targetHpPct)) &&
                (targetHpPct !== 0 || possibleResHpsRaw[index] === 0)
            ){
                validResHps.add(possibleResHpsRaw[index]);
            }
        })
    }
    return validResHps;
}

function recoil_findPossibleHpInvestments(attacker: AugmentedMon, recoilFactor: number, dmgRoll: number, possibleHpInvestments: Map<number, Set<number>>, targetHpPct: number){
    let pokemon = attacker.pokemon;
    let validHpInvestments = new Map<number, Set<number>>();
    for(const [hpEv, Hps] of possibleHpInvestments){
        let maxHpOnSpread = calcStat(gen, 'hp', pokemon.species.baseStats.hp, pokemon.ivs.hp, hpEv, pokemon.level, pokemon.nature);
        for(const hp of Hps){
            let recoilDamage = Math.max(1, Math.round(dmgRoll/recoilFactor));
            let postRecoilHp = Math.max(0, hp - recoilDamage);
            let postRecoilHpPct = postRecoilHp/maxHpOnSpread * 100;
            if(
                (Math.floor(postRecoilHpPct) === targetHpPct || 
                (targetHpPct === 1 && Math.ceil(postRecoilHpPct) === targetHpPct)) &&
                (targetHpPct !== 0 || postRecoilHp === 0)
            ){
                if(!validHpInvestments.has(hpEv)){
                    validHpInvestments.set(hpEv, new Set([postRecoilHp]));
                }
                else{
                    validHpInvestments.get(hpEv)!.add(postRecoilHp);
                }
            }
        }
    }
    return validHpInvestments;
}

function move_eliminateImpossibleEvSpreads(
    attacker: AugmentedMon,
    defender: AugmentedMon,
    move: Move,
    targetHpPct: number,
    hasRecoil:boolean=false,
    recoilFactor?: number,
    targetAttackerHpPct?: number,
    debug?:boolean
){
    let attackerNewPossibleSpreads = new Set<number>();
    let attackerNewPossibleHpEvs = new Map<number, Set<number>>();
    let defenderNewPossibleSpreads = new Map<StatsTable<number>, Set<number>>();
    let attackerMon = attacker.pokemon;
    let defenderMon = defender.pokemon;
    let attackerPossibleHpInvestments = new Map<number, Set<number>>();
    if(hasRecoil){
        for(const [spread, hps] of attacker.possibleDefensiveSpreads){
            let hpEv = spread.hp;
            if(!attackerPossibleHpInvestments.has(hpEv)){
                attackerPossibleHpInvestments.set(hpEv, hps);
            }
            else {
                attackerPossibleHpInvestments.set(
                    hpEv,
                    attackerPossibleHpInvestments.get(hpEv)!.union(hps)
                );
            }
        }
    }
    console.log("=======================================================================================")
    console.log(`${attackerMon.name} about to attack ${defenderMon.name} with ${move.name}`);
    console.log(`${attacker.possibleAttackEvs.size} possible attack EVs for ${attackerMon.name}`);
    console.log(`${defender.possibleDefensiveSpreads.size} possible def spreads for ${defenderMon.name}`);
    // let counter = 0;
    // let percent_counter = 0;
    let checkedDefensiveSpreads = new Map<string, Set<number>>();
    for(const [defenderEvs, defenderHps] of defender.possibleDefensiveSpreads){
        for(const defenderHp of defenderHps){
            // counter += 1
            // if(counter * 100 > defender.possibleDefensiveSpreads.size){
            //     percent_counter += 1;
            //     counter = 0
            //     // console.log(`${percent_counter}% done`);
            // }
            if(move.category === "Physical" && defenderEvs.spd !== 0){
                let relevantSpread = [defenderEvs.hp, defenderEvs.def].toString();
                if(checkedDefensiveSpreads.has(relevantSpread)){
                    defenderNewPossibleSpreads.set(defenderEvs, checkedDefensiveSpreads.get(relevantSpread)!)
                }
            }
            else if(move.category === "Special" && defenderEvs.def !== 0){
                let relevantSpread = [defenderEvs.hp, defenderEvs.spd].toString();
                if(checkedDefensiveSpreads.has(relevantSpread)){
                    defenderNewPossibleSpreads.set(defenderEvs, checkedDefensiveSpreads.get(relevantSpread)!)
                }
            }
            for(const attackerEvs of attacker.possibleAttackEvs){
                attackerMon.evs.atk = attackerEvs;
                attackerMon.evs.spa = attackerEvs;
                defenderMon.evs = defenderEvs;
                attackerMon.rawStats.atk = calcStat(gen, 'atk', attackerMon.species.baseStats.atk, attackerMon.ivs.atk, attackerMon.evs.atk, attackerMon.level, attackerMon.nature);
                attackerMon.rawStats.spa = calcStat(gen, 'spa', attackerMon.species.baseStats.spa, attackerMon.ivs.spa, attackerMon.evs.spa, attackerMon.level, attackerMon.nature)
                defenderMon.rawStats.def = calcStat(gen, 'def', defenderMon.species.baseStats.def, defenderMon.ivs.def, defenderMon.evs.def, defenderMon.level, defenderMon.nature)
                defenderMon.rawStats.spd = calcStat(gen, 'spd', defenderMon.species.baseStats.spd, defenderMon.ivs.spd, defenderMon.evs.spd, defenderMon.level, defenderMon.nature)
                defenderMon.originalCurHP = defenderHp;
                let validResHps = getPossibleResHps(move, attackerMon, defenderMon, targetHpPct, debug);
                if(hasRecoil){
                    for(const validResHp of validResHps){
                        let recoil_possibleHpInvestments = recoil_findPossibleHpInvestments(attacker, recoilFactor!, defenderMon.originalCurHP - validResHp, attackerPossibleHpInvestments, targetAttackerHpPct!);
                        if(recoil_possibleHpInvestments.size === 0){
                            validResHps.delete(validResHp);
                        }
                        for(const [hpEv, hps] of recoil_possibleHpInvestments){
                            if(!attackerNewPossibleHpEvs.has(hpEv)){
                                attackerNewPossibleHpEvs.set(hpEv, hps);
                            }
                            else {
                                attackerNewPossibleHpEvs.set(
                                    hpEv,
                                    attackerNewPossibleHpEvs.get(hpEv)!.union(hps)
                                );
                            }
                        }
                    }
                }
                if(validResHps.size > 0){
                    if(!attackerNewPossibleSpreads.has(attackerEvs)){
                        attackerNewPossibleSpreads.add(attackerEvs);
                    }
                    if(!defenderNewPossibleSpreads.has(defenderEvs)){
                        defenderNewPossibleSpreads.set(defenderEvs, validResHps);
                    }
                    else{
                        defenderNewPossibleSpreads.set(defenderEvs,
                            defenderNewPossibleSpreads.get(defenderEvs)!.union(validResHps)
                        )
                    }
                }
            }
        }
    }
    attacker.possibleAttackEvs = attackerNewPossibleSpreads;
    defender.possibleDefensiveSpreads = defenderNewPossibleSpreads;
    if(hasRecoil){
        for(const [spread, hps] of attacker.possibleDefensiveSpreads){
            let hpEv = spread.hp;
            if(!attackerNewPossibleHpEvs.has(hpEv)){
                attacker.possibleDefensiveSpreads.delete(spread);
            }
            else {
                attacker.possibleDefensiveSpreads.set(spread, attackerNewPossibleHpEvs.get(hpEv)!);
            }
        }
    }
    console.log(`${attackerMon.name} just attacked ${defenderMon.name} with ${move.name}`);
    console.log(`${attacker.possibleAttackEvs.size} possible attack EVs for ${attackerMon.name}`);
    console.log(`${defender.possibleDefensiveSpreads.size} possible def spreads for ${defenderMon.name}`);
    console.log(`${attacker.possibleDefensiveSpreads.size} possible def spreads for ${attackerMon.name}`);
    console.log("=======================================================================================")
}

function heal_eliminateImpossibleEvSpreads(augmentedMon: AugmentedMon, targetHpPct: number, logHealAmt: number){
    let newPossibleSpreads = new Map<StatsTable<number>, Set<number>>();
    let pokemon = augmentedMon.pokemon;
    console.log("=======================================================================================")
    console.log(`${pokemon.name} about to heal 1/${2**logHealAmt} HP`);
    console.log(`${augmentedMon.possibleDefensiveSpreads.size} possible def spreads for ${pokemon.name}`);
    for(const [defSpread, Hps] of augmentedMon.possibleDefensiveSpreads){
        let maxHpOnSpread = calcStat(gen, 'hp', pokemon.species.baseStats.hp, pokemon.ivs.hp, defSpread.hp, pokemon.level, pokemon.nature);
        let healAmount = maxHpOnSpread >> logHealAmt;
        let newPossibleHps = new Set<number>();
        for(const Hp of Hps){
            let postHealHp = Math.min(maxHpOnSpread, Hp + healAmount);
            let postHealHpPct = postHealHp / maxHpOnSpread * 100;
            if(Math.floor(postHealHpPct) === targetHpPct){
                newPossibleHps.add(postHealHp);
            }
        }
        if(newPossibleHps.size > 0){
            newPossibleSpreads.set(defSpread, newPossibleHps)
        }
    }
    augmentedMon.possibleDefensiveSpreads = newPossibleSpreads;
    console.log(`${pokemon.name} just healed 1/${2**logHealAmt} HP`);
    console.log(`${augmentedMon.possibleDefensiveSpreads.size} possible def spreads for ${pokemon.name}`);
    console.log("=======================================================================================")
}

function selfdmg_eliminateImpossibleEvSpreads(augmentedMon: AugmentedMon, targetHpPct: number, selfDmgFactor: number){
    let newPossibleSpreads = new Map<StatsTable<number>, Set<number>>();
    let pokemon = augmentedMon.pokemon;
    console.log("=======================================================================================")
    console.log(`${pokemon.name} about to do 1/${selfDmgFactor} HP self-damage`);
    console.log(`${augmentedMon.possibleDefensiveSpreads.size} possible def spreads for ${pokemon.name}`);
    for(const [defSpread, Hps] of augmentedMon.possibleDefensiveSpreads){
        let maxHpOnSpread = calcStat(gen, 'hp', pokemon.species.baseStats.hp, pokemon.ivs.hp, defSpread.hp, pokemon.level, pokemon.nature);
        let selfDmgAmt = Math.floor(maxHpOnSpread / selfDmgFactor);
        let newPossibleHps = new Set<number>();
        for(const Hp of Hps){
            let postDmgHp = Math.max(Hp - selfDmgAmt, 0);
            let postDmgHpPct = postDmgHp / maxHpOnSpread * 100;
            if(
                ((Math.floor(postDmgHpPct) === targetHpPct) || 
                (targetHpPct === 1 && Math.ceil(postDmgHpPct) === targetHpPct)) &&
                (targetHpPct !== 0 || postDmgHp === 0)
            ){
                newPossibleHps.add(postDmgHp);
            }
        }
        if(newPossibleHps.size > 0){
            newPossibleSpreads.set(defSpread, newPossibleHps)
        }
    }
    augmentedMon.possibleDefensiveSpreads = newPossibleSpreads;
    console.log(`${pokemon.name} just did 1/${selfDmgFactor} HP self-damage`);
    console.log(`${augmentedMon.possibleDefensiveSpreads.size} possible def spreads for ${pokemon.name}`);
    console.log("=======================================================================================")
}

function resetTeam(team: Record<string, AugmentedMon>){
    for(const [_, fullData] of Object.entries(team)){
        let pokemon = fullData.pokemon;
        for(const [spread, _] of fullData.possibleDefensiveSpreads){
            let maxHpOnSpread = calcStat(gen, 'hp', pokemon.species.baseStats.hp, pokemon.ivs.hp, pokemon.evs.hp, pokemon.level, pokemon.nature);
            fullData.possibleDefensiveSpreads.set(
                spread,
                new Set([maxHpOnSpread])
            );
        }
        pokemon.boosts = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
    }
}

var team1 = {
    "Zard": new AugmentedMon(
            new Pokemon(gen, 'Charizard-Mega-Y', {
            level: 50,
            ability: 'Drought',
            item: 'Charizardite Y',
            nature: 'Modest',
            evs: {},
            boosts: {}
        }),
        undefined,
        new Set([0,1])
    ),
    "Aero": new AugmentedMon(
        new Pokemon(
            gen,
            "Aerodactyl",
            {
                level: 50,
                ability: 'Unnerve',
                item: "Focus Sash",
                nature: 'Jolly',
            }
        ), 
        new Map<StatsTable<number>, Set<number>>([
            [{ hp: 2, atk: 32, spa:0, spe: 32, def: 0, spd: 0 }, new Set([157])]
        ]),
        new Set([32])
    ),
    "Chomp": new AugmentedMon(
        new Pokemon(
            gen, "Garchomp",
            {
                level: 50,
                ability: 'Rough Skin',
                item: "Sitrus Berry",
                nature: 'Jolly',
            }
        )
    ),
    "Kingambit": new AugmentedMon(
        new Pokemon(
            gen, "Kingambit",
            {
                level: 50,
                ability: 'Defiant',
                item: 'Chople Berry',
                nature: 'Adamant'
            }
        ), 
        new Map<StatsTable<number>, Set<number>>([
            [{ hp: 32, atk: 32, spa:0, spe: 0, def: 2, spd: 0 }, new Set([207])],
        ]),
        new Set([32])
    ),
        "Indeedee": new AugmentedMon(
            new Pokemon(
                gen, "Indeedee-F",
                {
                    level: 50,
                    ability: 'Psychic Surge',
                    item: 'Rocky Helmet',
                    nature: 'Bold'
                }
            )
        ),
        "Gard": new AugmentedMon(
            new Pokemon(
                gen, "Gardevoir-Mega",
                {
                    level: 50,
                    ability: 'Pixilate',
                    item: 'Gardevoirite',
                    nature: 'Modest'
                }
            )
        )
}

var team2 = {
    "Rilla": new AugmentedMon(
        new Pokemon(gen, 'Rillaboom', {
            level: 50,
            ability: 'Grassy Surge',
            item: 'Eject Button',
            nature: 'Sassy',
        }), 
        new Map<StatsTable<number>, Set<number>>([
            [{ hp: 32, atk: 0, spa:0, spe: 0, def: 4, spd: 30 }, new Set([207])]
        ]),
        new Set([0])
    ),
    "Sneasler": new AugmentedMon(
        new Pokemon(gen, 'Sneasler', {
            level: 50,
            ability: 'Unburden',
            item: 'Grassy Seed',
            nature: 'Adamant',
        })
    ),
    "Kommo-o": new AugmentedMon(
        new Pokemon(gen, 'Kommo-o', {
            level: 50,
            ability: 'Soundproof',
            item: 'Leftovers',
            nature: 'Modest'
        }), 
        new Map<StatsTable<number>, Set<number>>([
            [{ hp: 10, atk: 0, spa:30, spe: 0, def: 18, spd: 8 }, new Set([160])],
        ]),
        new Set([30])
    ),
    "Incin": new AugmentedMon(
        new Pokemon(gen, "Incineroar", {
            level: 50,
            ability: 'Intimidate',
            item: 'Sitrus Berry',
            nature: 'Sassy'
        }), 
        new Map<StatsTable<number>, Set<number>>([
            [{ hp: 31, atk: 0, spa:0, spe: 0, def: 21, spd: 14 }, new Set([201])],
            [{ hp: 31, atk: 0, spa:0, spe: 0, def: 15, spd: 20 }, new Set([201])],
            [{ hp: 31, atk: 0, spa:0, spe: 0, def: 14, spd: 21 }, new Set([201])],
        ]),
        new Set([0])
    ),
    "Gengar": new AugmentedMon(
        new Pokemon(gen, "Gengar-Mega", {
            level: 50,
            ability: 'Shadow Tag',
            item: 'Gengarite',
            nature: 'Modest'
        })
    )
}


let HW = new Move(gen, 'Heat Wave');
let ClangScale = new Move(gen, 'Clanging Scales');
let RS = new Move(gen, 'Rock Slide');
let FO = new Move(gen, 'Fake Out');
let Stomp = new Move(gen, 'Stomping Tantrum');
let Kowtow = new Move(gen, 'Kowtow Cleave');
let EForce = new Move(gen, 'Expanding Force');
let HVoice = new Move(gen, 'Hyper Voice');

let battleLog = [
    // Rillaboom In
    (() => boardState.terrain='Grassy'),
    // Charizard mega evolves
    (() => boardState.weather='Sun'),
    () => move_eliminateImpossibleEvSpreads(team2.Rilla, team1.Aero, new Move(gen, 'Grassy Glide'), 54),
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2.Sneasler, HW, 29),
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2['Kommo-o'], HW, 66),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Sneasler'], 35, 4),
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 73, 4),
    // Leftovers
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 79, 4),
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2['Kommo-o'], HW, 47),
    // Clangorous Soul
    () => selfdmg_eliminateImpossibleEvSpreads(team2['Kommo-o'], 14, 3),
    () => team2['Kommo-o'].pokemon.boosts = {hp: 0, atk:1, def: 1, spa: 1, spd: 1, spe: 1},
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Sneasler'], 41, 4),
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 20, 4),
    // Leftovers
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 26, 4),
    // Incin switches in
    () => team1.Zard.pokemon.boosts.atk -= 1,
    () => team1.Aero.pokemon.boosts.atk -= 1,
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2.Incin, HW, 77),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 33, 4),
    () => heal_eliminateImpossibleEvSpreads(team2['Incin'], 83, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 39, 4),
    // Terrain Ends
    () => boardState.terrain = undefined,
    () => move_eliminateImpossibleEvSpreads(team1.Aero, team2.Incin, RS, 55),
    () => move_eliminateImpossibleEvSpreads(team1.Aero, team2['Kommo-o'], RS, 33),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Aero, new Move(gen, 'Aura Sphere'), 0),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 40, 4),
    // Sun Ends
    () => boardState.weather = undefined,
    // Rilla swaps in
    () => boardState.terrain = 'Grassy',
    () => move_eliminateImpossibleEvSpreads(team1.Chomp, team2.Rilla, new Move(gen, 'Earthquake'), 92),
    // Eject button ==> incin
    () => team1.Chomp.pokemon.boosts.atk -= 1,
    () => team1.Zard.pokemon.boosts.atk -= 1,
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2.Incin, HW, 39),
    // Sitrus
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 64, 2),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 46, 4),
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 70, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 52, 4),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Kingambit, ClangScale, 73),
    () => team2['Kommo-o'].pokemon.boosts.def -= 1,
    () => move_eliminateImpossibleEvSpreads(team2.Incin, team1.Kingambit, new Move(gen, 'Flare Blitz'), 8, true, 3, 48),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 58, 4),
    () => heal_eliminateImpossibleEvSpreads(team1.Kingambit, 14, 4),
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 54, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 65, 4),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Kingambit, ClangScale, 0),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Chomp, ClangScale, 0),
    () => team2['Kommo-o'].pokemon.boosts.def -= 1,
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 71, 4),
    () => heal_eliminateImpossibleEvSpreads(team2.Sneasler, 47, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 77, 4),
]
let game2Log = [
    // Intimidate
    () => team1.Kingambit.pokemon.boosts.atk -= 1,
    () => team1.Chomp.pokemon.boosts.atk -= 1,
    // Defiant
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    () => move_eliminateImpossibleEvSpreads(team2.Incin, team1.Kingambit, FO, 95),
    () => move_eliminateImpossibleEvSpreads(team1.Chomp, team2.Incin, Stomp, 61),// false, undefined, undefined, true),
    // Rillaboom in
    () => boardState.terrain = 'Grassy',
    () => move_eliminateImpossibleEvSpreads(team1.Chomp, team2.Incin, Stomp, 25),
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 50, 2),
    () => move_eliminateImpossibleEvSpreads(team1.Kingambit, team2.Rilla, Kowtow, 34),
    // Parting Shot
    () => team1.Kingambit.pokemon.boosts.atk -= 1,
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    () => team1.Kingambit.pokemon.boosts.spa -= 1,
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    // Indeedee in
    () => boardState.terrain = 'Psychic',
    // Incin in, intimidate
    () => team1.Gard.pokemon.boosts.atk -= 1,
    () => team1.Indeedee.pokemon.boosts.atk -= 1,
    () => move_eliminateImpossibleEvSpreads(team1.Gard, team2.Gengar, EForce, 0),
    // Helping hand Hyper Voice
    () => boardState.attackerSide.isHelpingHand = true,
    () => move_eliminateImpossibleEvSpreads(team1.Gard, team2.Incin, HVoice, 0),
    () => boardState.attackerSide.isHelpingHand = false,
];

for(const event of battleLog){
    event();
}
resetTeam(team1);
resetTeam(team2);
boardState.weather = undefined;
boardState.terrain = undefined;
for(const event of game2Log){
    event();
}
console.log("Kommo-o has ", team2['Kommo-o'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Sneasler has ", team2['Sneasler'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Rillaboom has ", team2['Rilla'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Incineroar has ", team2['Incin'].possibleDefensiveSpreads.size, " possible defensive spreads");
for(const ev of team2.Rilla.possibleAttackEvs){
    console.log(ev);
}