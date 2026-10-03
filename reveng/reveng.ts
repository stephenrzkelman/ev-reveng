import {calculateChampions} from '../calc/src/mechanics/champions';
import { Generations } from "../calc/src/data";
import { Dex, StatsTable, Weather } from '@pkmn/dex';
import { calcStat, Pokemon, Move, Field } from "../calc/src";
import { Side } from '../calc/src';
import type * as I from '../calc/src/data';

export const gen = Generations.get(0);

const allPotentialDefensiveSpreads = new Set<StatsTable<number>>();
for(let hp = 0; hp <= 32; hp += 1){
    for(let def = 0; def <= Math.min(32, 66-(hp)); def += 1){
        for(let spd = 0; spd <= Math.min(32, 66-(hp+def)); spd += 1){
            allPotentialDefensiveSpreads.add({hp: hp, atk: 0, def: def, spa: 0, spd: spd, spe: 0});
        }
    }
};
console.log(`${allPotentialDefensiveSpreads.size} total possible defensive spreads`);

export class AugmentedMon{
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

function getPossibleResHps(move: Move, attacker: Pokemon, defender: Pokemon, targetHpPct: number, field:Field, debug?: boolean){
    var totalDefenderHp = calcStat(gen, 'hp', defender.species.baseStats.hp, defender.ivs.hp, defender.evs.hp, defender.level, defender.nature);
    var result = calculateChampions(
        gen,
        attacker,
        defender,
        move,
        field
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

export function move(
    attacker: AugmentedMon,
    defender: AugmentedMon,
    move: Move,
    targetHpPct: number,
    boardState: Field,
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
                let validResHps = getPossibleResHps(move, attackerMon, defenderMon, targetHpPct, boardState, debug);
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

export function heal(augmentedMon: AugmentedMon, targetHpPct: number, logHealAmt: number){
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

export function selfdmg(augmentedMon: AugmentedMon, targetHpPct: number, selfDmgFactor: number){
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

function resetAttribute(attribute: boolean){
    attribute = false;
}

function resetField(field: Field) {
  for (const key of Object.keys(field.attackerSide) as (keyof Side)[]) {
    if (field.attackerSide[key] === true) {
      resetAttribute(field.attackerSide[key]);
    }
  }
  for (const key of Object.keys(field.defenderSide) as (keyof Side)[]) {
    if (field.defenderSide[key] === true) {
      resetAttribute(field.defenderSide[key]);
    }
  }
  for (const key of Object.keys(field) as (keyof Field)[]) {
    if (field[key] === true) {
        resetAttribute(field[key]);
    }
  }
}


export function resetForNextBattle(team1: Record<string, AugmentedMon>, team2: Record<string, AugmentedMon>, boardState: Field){
    resetTeam(team1);
    resetTeam(team2);
    resetField(boardState);
}
