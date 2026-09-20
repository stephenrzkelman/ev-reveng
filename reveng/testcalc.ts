import {calculateChampions} from '../calc/src/mechanics/champions';
import { Generations } from "../calc/src/data";
import { Dex, StatsTable } from '@pkmn/dex';
import { Pokemon } from "../calc/src";
import { Move } from '../calc/src';
import { Field } from "../calc/src";
import { Weather } from '@pkmn/dex';
import type * as I from '../calc/src/data';
import { calcStat } from '../calc/src';

const gen = Generations.get(0);
const boardState = new Field(
    {
        gameType: 'Doubles'
    }
)
let r = new Pokemon(gen, 'Rillaboom', {
            level: 50,
            ability: 'Grassy Surge',
            item: 'Eject Button',
            nature: 'Sassy',
        })
let s = new Pokemon(gen, "Sableye", {
    level: 50,
    ability: 'Prankster',
    item: 'Light Clay',
    nature: 'Sassy'
})
let k = new Pokemon(gen, 'Kommo-o', {
            level: 50,
            ability: 'Soundproof',
            item: 'Leftovers',
            nature: 'Modest'
        })
let g = new Pokemon(gen, 'Gardevoir-Mega', {
    level: 50,
    ability: 'Pixilate',
    item: 'Gardevoirite',
    nature: 'Modest'
})


// k.boosts.spa -= 1
// console.log(calculateChampions(
//     gen,
//     k,
//     r,
//     new Move(gen, 'Clanging Scales'),
//     boardState
// ).damage)

// let a = new Set<number[]>
// a.add([1,2]);
// console.log(a.has([1,2]));

var team1 = {
    "Zard": new Pokemon(gen, 'Charizard-Mega-Y', {
            level: 50,
            ability: 'Drought',
            item: 'Charizardite Y',
            nature: 'Modest',
            evs: {},
            boosts: {}
        }),
    "Aero": new Pokemon(
            gen,
            "Aerodactyl",
            {
                level: 50,
                ability: 'Unnerve',
                item: "Focus Sash",
                nature: 'Jolly',
            }
        ),
    "Chomp": new Pokemon(
            gen, "Garchomp",
            {
                level: 50,
                ability: 'Rough Skin',
                item: "Sitrus Berry",
                nature: 'Jolly',
                evs: {atk: 0}
            }
        ),
    "Kingambit":new Pokemon(
        gen, "Kingambit",
        {
            level: 50,
            ability: 'Defiant',
            item: 'Chople Berry',
            nature: 'Adamant'
        }
    ),
    "Indeedee": new Pokemon(
        gen, "Indeedee-F",
        {
            level: 50,
            ability: 'Psychic Surge',
            item: 'Rocky Helmet',
            nature: 'Bold'
        }
    ),
    "Gard": new Pokemon(
        gen, "Gardevoir-Mega",
        {
            level: 50,
            ability: 'Pixilate',
            item: 'Gardevoirite',
            nature: 'Modest'
        }
    )
}

var team2 = {
    "Rilla": new Pokemon(gen, 'Rillaboom', {
            level: 50,
            ability: 'Grassy Surge',
            item: 'Eject Button',
            nature: 'Sassy',
        }),
    "Sneasler": new Pokemon(gen, 'Sneasler', {
            level: 50,
            ability: 'Unburden',
            item: 'Grassy Seed',
            nature: 'Adamant',
        }),
    "Kommo-o": new Pokemon(gen, 'Kommo-o', {
            level: 50,
            ability: 'Soundproof',
            item: 'Leftovers',
            nature: 'Modest'
        }),
    "Incin": new Pokemon(gen, "Incineroar", {
            level: 50,
            ability: 'Intimidate',
            item: 'Sitrus Berry',
            nature: 'Sassy',
            evs: {hp: 31, def: 15}
        }),
    "Gengar": new Pokemon(gen, "Gengar-Mega", {
            level: 50,
            ability: 'Shadow Tag',
            item: 'Gengarite',
            nature: 'Modest'
        })
}

team1.Chomp.boosts.atk -= 1;
console.log(calculateChampions(
    gen,
    team1.Chomp,
    team2.Incin,
    new Move(gen, 'Stomping Tantrum'),
    boardState
).damage)
