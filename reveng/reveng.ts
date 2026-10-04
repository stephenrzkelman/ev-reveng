import {calculateChampions} from '../calc/src/mechanics/champions';
import { Generations } from "../calc/src/data";
import { StatsTable, AbilityName, ItemName } from '@pkmn/dex';
import { calcStat, Pokemon, Move, Field } from "../calc/src";
import { Side } from '../calc/src';

export const gen = Generations.get(0);

type Range = {
    lo: number,
    hi: number
}

export function range(lo: number, hi: number){
    return {lo: lo, hi: hi};
}

type PossibleBulk = {
    totalHp: number,
    remainingHp: Set<number>,
    spd: Set<number>,
    def: Set<number>
}

type PossibleOffense = {
    atk: Set<number>,
    spa: Set<number>
}

type OtsInfo = {
    level: 50,
    ability: string,
    item: string,
    nature: string
}

export function totalDefensiveSpreadCount(mon: AugmentedMon, statName: 'spd' | 'def') {
    return Array.from(mon.possibleBulkInvestment.values()).reduce((sum, fullBulkData) => sum + fullBulkData[statName].size, 0)
}

export class AugmentedMon{
    pokemon: Pokemon;
    otsInfo: OtsInfo;
    possibleBulkInvestment: Map<number, PossibleBulk>;
    possibleOffensiveInvestment: PossibleOffense;
    constructor(pokemonName: string, pokemonOtsInfo: OtsInfo, evs: Partial<StatsTable<number | number[] | Range>> = {}){
        this.pokemon = new Pokemon(gen, pokemonName, pokemonOtsInfo);
        this.otsInfo = pokemonOtsInfo;
        function getEvPossibilities(statName: string){
            let evPossibilities = new Set<number>();
            if(statName in evs){
                let stat = statName as keyof Partial<StatsTable<number | number[] | Range>>;
                if (typeof evs[stat] === 'number') {
                    evPossibilities.add(evs[stat])
                }
                else if (Array.isArray(evs[stat])) {
                    for(const possibleEv of evs[stat]) {
                        evPossibilities.add(possibleEv)
                    }
                }
                else {
                    for(let possibleEv = evs[stat]!.lo; possibleEv <= evs[stat]!.hi; possibleEv++) {
                        evPossibilities.add(possibleEv);
                    }
                }
            }
            else {
                for(let possibleEv = 0; possibleEv <= 32; possibleEv++) {
                    evPossibilities.add(possibleEv);
                }
            }
            return evPossibilities;
        }
        this.possibleOffensiveInvestment = {
            atk: getEvPossibilities('atk'),
            spa: getEvPossibilities('spa')
        };
        this.possibleBulkInvestment = new Map<number, PossibleBulk>();
        let possibleDefEvs = getEvPossibilities('def');
        let possibleSpdEvs = getEvPossibilities('spd');
        let possibleHpEvs = getEvPossibilities('hp');
        for(const possibleHpEv of possibleHpEvs) {
            this.possibleBulkInvestment.set(possibleHpEv, {
                totalHp: calcStat(gen, 'hp', this.pokemon.species.baseStats.hp, this.pokemon.ivs.hp, possibleHpEv, this.pokemon.level, this.pokemon.nature),
                remainingHp: new Set([calcStat(gen, 'hp', this.pokemon.species.baseStats.hp, this.pokemon.ivs.hp, possibleHpEv, this.pokemon.level, this.pokemon.nature)]),
                def: new Set(possibleDefEvs),
                spd: new Set(possibleSpdEvs)
            });
        }
    }

    linkSpreads(otherMon: AugmentedMon) {
        this.possibleBulkInvestment = otherMon.possibleBulkInvestment;
        this.possibleOffensiveInvestment = otherMon.possibleOffensiveInvestment;
        this.pokemon.boosts = otherMon.pokemon.boosts;
    }
}

function getPossibleResHps(move: Move, attacker: Pokemon, defender: Pokemon, defenderTotalHp:number, targetHpPct: number, field:Field, debug?: boolean){
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
        var possibleResHpsPct = possibleResHpsRaw.map((hp) => hp/defenderTotalHp*100);
        if (debug) console.log(possibleResHpsPct);
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

function recoil_findPossibleHpInvestments(attacker: AugmentedMon, recoilFactor: number, dmgRoll: number, possibleHpInvestments: Map<number, PossibleBulk>, targetHpPct: number){
    let validHpInvestments = new Map<number, Set<number>>();
    for(const [hpEv, fullBulkData] of possibleHpInvestments){
        let maxHpOnSpread = fullBulkData.totalHp;
        for(const hp of fullBulkData.remainingHp){
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
    // assuming the move category is not status here
    const relevantDefensiveStat = (move.overrideDefensiveStat === 'spd' || move.category === 'Special') ? 'spd' : 'def';
    const relevantAttackingStat = (move.overrideOffensiveStat === 'spa' || move.category === 'Special') ? 'spa' : 'atk';
    let attackerNewPossibleAttackEvs = new Set<number>();
    let attackerNewPossibleHpEvs = new Map<number, Set<number>>();
    let attackerMon = attacker.pokemon;
    let defenderMon = defender.pokemon;
    console.log("=======================================================================================")
    console.log(`${attackerMon.name} about to attack ${defenderMon.name} with ${move.name}`);
    console.log(`${attacker.possibleOffensiveInvestment[relevantAttackingStat].size} possible ${relevantAttackingStat} EVs for ${attackerMon.name}`);
    console.log(`${totalDefensiveSpreadCount(defender, relevantDefensiveStat)} possible relevant ${relevantDefensiveStat} spreads for ${defenderMon.name}`);
    if(hasRecoil) console.log(`${attacker.possibleBulkInvestment.size} possible HP EVs for ${attackerMon.name}`);
    // let counter = 0;
    // let percent_counter = 0;
    for(const [hpEv, fullBulkData] of defender.possibleBulkInvestment){
        if (debug) console.log(`defender: {hp: ${hpEv}}`)
        let defenderNewPossibleDefEvs = new Set<number>();
        let defenderPossibleResHps = new Set<number>();
        for(const defenderHp of fullBulkData.remainingHp){
            for(const defendingEv of fullBulkData[relevantDefensiveStat]){
                for(const attackingEv of attacker.possibleOffensiveInvestment[relevantAttackingStat]){
                    if (debug) console.log(`defender: {hp: ${hpEv}/${defenderHp}, ${relevantDefensiveStat}: ${defendingEv}}, attacker: {${relevantAttackingStat}: ${attackingEv}}`)
                    attackerMon.evs[relevantAttackingStat] = attackingEv;
                    defenderMon.evs[relevantDefensiveStat] = defendingEv;
                    attackerMon.rawStats[relevantAttackingStat] = calcStat(
                        gen,
                        relevantAttackingStat,
                        attackerMon.species.baseStats[relevantAttackingStat],
                        attackerMon.ivs[relevantAttackingStat],
                        attackerMon.evs[relevantAttackingStat],
                        attackerMon.level,
                        attackerMon.nature
                    );
                    defenderMon.rawStats[relevantDefensiveStat] = calcStat(
                        gen,
                        relevantDefensiveStat,
                        defenderMon.species.baseStats[relevantDefensiveStat],
                        defenderMon.ivs[relevantDefensiveStat],
                        defenderMon.evs[relevantDefensiveStat],
                        defenderMon.level,
                        defenderMon.nature
                    );
                    defenderMon.originalCurHP = defenderHp;
                    let validResHps = getPossibleResHps(move, attackerMon, defenderMon, defender.possibleBulkInvestment.get(hpEv)!.totalHp, targetHpPct, boardState, debug);
                    if (debug) console.log(validResHps);
                    if(hasRecoil){
                        for(const validResHp of validResHps){
                            let recoil_possibleHpInvestments = recoil_findPossibleHpInvestments(attacker, recoilFactor!, defenderMon.originalCurHP - validResHp, attacker.possibleBulkInvestment, targetAttackerHpPct!);
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
                        attackerNewPossibleAttackEvs.add(attackingEv);
                        defenderNewPossibleDefEvs.add(defendingEv);
                        validResHps.forEach(remainingHp => defenderPossibleResHps.add(remainingHp));
                    }
                }
            }
        }
        if (defenderNewPossibleDefEvs.size > 0 && defenderPossibleResHps.size > 0) {
            let defenderCurBulkInfo = defender.possibleBulkInvestment.get(hpEv)!
            defenderCurBulkInfo[relevantDefensiveStat] = defenderNewPossibleDefEvs;
            defenderCurBulkInfo.remainingHp = defenderPossibleResHps;
        }
        else {
            defender.possibleBulkInvestment.delete(hpEv);
        }
    }
    attacker.possibleOffensiveInvestment[relevantAttackingStat] = attackerNewPossibleAttackEvs;
    if(hasRecoil){
        for(const [hpEv, fullBulkData] of attacker.possibleBulkInvestment){
            if(!attackerNewPossibleHpEvs.has(hpEv)){
                attacker.possibleBulkInvestment.delete(hpEv);
            }
            else {
                attacker.possibleBulkInvestment.get(hpEv)!.remainingHp = attackerNewPossibleHpEvs.get(hpEv)!;
            }
        }
    }
    console.log(`${attackerMon.name} just attacked ${defenderMon.name} with ${move.name}`);
    console.log(`${attacker.possibleOffensiveInvestment[relevantAttackingStat].size} possible ${relevantAttackingStat} EVs for ${attackerMon.name}`);
    console.log(`${totalDefensiveSpreadCount(defender, relevantDefensiveStat)} possible relevant ${relevantDefensiveStat} spreads for ${defenderMon.name}`);
    if(hasRecoil) console.log(`${attacker.possibleBulkInvestment.size} possible HP EVs for ${attackerMon.name}`);
    console.log("=======================================================================================")
}

export function heal(augmentedMon: AugmentedMon, targetHpPct: number, logHealAmt: number){
    let pokemon = augmentedMon.pokemon;
    console.log("=======================================================================================")
    console.log(`${pokemon.name} about to heal 1/${2**logHealAmt} HP`);
    console.log(`${augmentedMon.possibleBulkInvestment.size} possible HP EVs for ${pokemon.name}`);
    for(const [hpEv, fullBulkData] of augmentedMon.possibleBulkInvestment){
        let maxHpOnSpread = fullBulkData.totalHp;
        let healAmount = maxHpOnSpread >> logHealAmt;
        let newPossibleHps = new Set<number>();
        let Hps = fullBulkData.remainingHp;
        for(const Hp of Hps){
            let postHealHp = Math.min(maxHpOnSpread, Hp + healAmount);
            let postHealHpPct = postHealHp / maxHpOnSpread * 100;
            if(Math.floor(postHealHpPct) === targetHpPct){
                newPossibleHps.add(postHealHp);
            }
        }
        if(newPossibleHps.size > 0){
            fullBulkData.remainingHp = newPossibleHps
        }
        else {
            augmentedMon.possibleBulkInvestment.delete(hpEv);
        }
    }
    console.log(`${pokemon.name} just healed 1/${2**logHealAmt} HP`);
    console.log(`${augmentedMon.possibleBulkInvestment.size} possible HP EVs for ${pokemon.name}`);
    console.log("=======================================================================================")
}

export function selfdmg(augmentedMon: AugmentedMon, targetHpPct: number, selfDmgFactor: number){
    let pokemon = augmentedMon.pokemon;
    console.log("=======================================================================================")
    console.log(`${pokemon.name} about to do 1/${selfDmgFactor} HP self-damage`);
    console.log(`${augmentedMon.possibleBulkInvestment.size} possible HP EVs for ${pokemon.name}`);
    for(const [hpEv, fullBulkData] of augmentedMon.possibleBulkInvestment){
        let maxHpOnSpread = fullBulkData.totalHp;
        let selfDmgAmt = Math.floor(maxHpOnSpread / selfDmgFactor);
        let newPossibleHps = new Set<number>();
        let Hps = fullBulkData.remainingHp;
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
            fullBulkData.remainingHp = newPossibleHps
        }
        else {
            augmentedMon.possibleBulkInvestment.delete(hpEv);
        }
    }
    console.log(`${pokemon.name} just did 1/${selfDmgFactor} HP self-damage`);
    console.log(`${augmentedMon.possibleBulkInvestment.size} possible HP EVs for ${pokemon.name}`);
    console.log("=======================================================================================")
}

export function swapReset(mon: AugmentedMon) {
    mon.pokemon.boosts = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
    mon.pokemon.ability = mon.otsInfo.ability as AbilityName;
}

export function fullReset(mon: AugmentedMon) {
    swapReset(mon);
    for(const [_, fullBulkData] of mon.possibleBulkInvestment){
        fullBulkData.remainingHp = new Set([fullBulkData.totalHp]);
    }
    mon.pokemon.item = mon.otsInfo.item as ItemName;
}

export function resetTeam(team: Record<string, AugmentedMon>){
    for(const [_, fullData] of Object.entries(team)){
        fullReset(fullData);
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
