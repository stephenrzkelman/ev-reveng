import { AugmentedMon, gen, range } from "../../reveng";
import { Pokemon, Move } from "../../../calc/src";

export var joeTeam = {
    "Mence": new AugmentedMon(
        'Salamence',
        {
            level: 50,
            ability: 'Intimidate',
            item: 'Salamencite',
            nature: 'Timid',
        }
    ),
    "MegaMence": new AugmentedMon(
        'Salamence-Mega',
        {
            level: 50,
            ability: 'Aerilate',
            item: 'Salamencite',
            nature: 'Timid',
        }
    ),
    "Ttar": new AugmentedMon(
        "Tyranitar",
        {
            level: 50,
            ability: 'Sand Stream',
            item: "Tyranitarite",
            nature: 'Jolly',
        }
    ),
    "MegaTtar": new AugmentedMon(
        'Tyranitar-Mega',
        {
            level: 50,
            ability: 'Sand Stream',
            item: "Tyranitarite",
            nature: 'Jolly',
        }
    ),
    "Corv": new AugmentedMon(
        "Corviknight",
        {
            level: 50,
            ability: 'Mirror Armor',
            item: "Psychic Seed",
            nature: 'Careful',
        }
    ),
    "Exca": new AugmentedMon(
        "Excadrill",
        {
            level: 50,
            ability: 'Sand Rush',
            item: 'Focus Sash',
            nature: 'Jolly'
        }
    ),
    "Indeedee": new AugmentedMon(
        "Indeedee",
        {
            level: 50,
            ability: 'Psychic Surge',
            item: 'Choice Scarf',
            nature: 'Modest'
        }
    ),
    "Sneasler": new AugmentedMon(
        "Sneasler",
        {
            level: 50,
            ability: 'Unburden',
            item: 'White Herb',
            nature: 'Adamant'
        }
    )
}

export let move_shortnames = {
    HV : new Move(gen, 'Hyper Voice'),
    Draco : new Move(gen, 'Draco'),
    Flamethrower : new Move(gen, 'Flamethrower'),
    RockSlide : new Move(gen, 'Rock Slide'),
    KnockOff : new Move(gen, 'Knock Off'),
    LowKick : new Move(gen, 'Low Kick'),
    BraveBird : new Move(gen, 'Brave Bird'),
    PowerTrip : new Move(gen, 'Power Trip'),
    BulkUp : new Move(gen, 'Bulk Up'),
    Roost : new Move(gen, 'Roost'),
    IronHead : new Move(gen, 'Iron Head'),
    HighHorsepower : new Move(gen, 'High Horsepower'),
    EForce : new Move(gen, 'Expanding Force'),
    MysticalFire : new Move(gen, 'Mystical Fire'),
    DireClaw : new Move(gen, 'Dire Claw'),
    CC : new Move(gen, 'Close Combat'),
}

joeTeam.Ttar.linkSpreads(joeTeam.MegaTtar);
joeTeam.Mence.linkSpreads(joeTeam.MegaMence);
