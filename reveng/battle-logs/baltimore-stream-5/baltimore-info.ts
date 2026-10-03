import { AugmentedMon, gen } from "../../reveng";
import { Pokemon, Field, Move } from "../../../calc/src";
import { StatsTable } from '@pkmn/dex';

export const boardState = new Field(
    {
        gameType: 'Doubles'
    }
);
export var team1 = {
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

export var team2 = {
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

export let move_shortnames = {
    HW : new Move(gen, 'Heat Wave'),
    ClangScale : new Move(gen, 'Clanging Scales'),
    RS : new Move(gen, 'Rock Slide'),
    FO : new Move(gen, 'Fake Out'),
    Stomp : new Move(gen, 'Stomping Tantrum'),
    Kowtow : new Move(gen, 'Kowtow Cleave'),
    EForce : new Move(gen, 'Expanding Force'),
    HVoice : new Move(gen, 'Hyper Voice')
} 