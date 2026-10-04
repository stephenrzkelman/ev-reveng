import { AugmentedMon, gen, range } from "../../../reveng";
import { Pokemon, Move } from "../../../../calc/src";

export var lorenzoTeam = {
    "Raichu": new AugmentedMon(
        'Raichu',
        {
            level: 50,
            ability: 'Lightning Rod',
            item: 'Raichunite Y',
            nature: 'Timid',
        }
    ),
    "YChu": new AugmentedMon(
        'Raichu-Mega-Y',
        {
            level: 50,
            ability: 'No Guard',
            item: 'Raichunite Y',
            nature: 'Timid',
        }
    ),
    "Staraptor": new AugmentedMon(
        "Staraptor",
        {
            level: 50,
            ability: 'Intimidate',
            item: "Staraptite",
            nature: 'Jolly',
        }
    ),
    "MegaStaraptor": new AugmentedMon(
        "Staraptor-Mega",
        {
            level: 50,
            ability: 'Contrary',
            item: "Staraptite",
            nature: 'Jolly',
        }
    ),
    "Ceruledge": new AugmentedMon(
        "Ceruledge",
        {
            level: 50,
            ability: 'Flash Fire',
            item: "Grassy Seed",
            nature: 'Adamant',
        }
    ),
    "Ghold": new AugmentedMon(
        "Gholdengo",
        {
            level: 50,
            ability: 'Good as Gold',
            item: 'Life Orb',
            nature: 'Modest'
        }
    ),
    "Milo": new AugmentedMon(
        "Milotic",
        {
            level: 50,
            ability: 'Competitive',
            item: 'Sitrus Berry',
            nature: 'Calm'
        }
    ),
    "Rilla": new AugmentedMon(
        "Rillaboom",
        {
            level: 50,
            ability: 'Grassy Surge',
            item: 'Miracle Seed',
            nature: 'Adamant'
        }
    )
}

export let move_shortnames = {
    Zap : new Move(gen, 'Zap Cannon'),
    FO : new Move(gen, 'Fake Out'),
    FocusBlast : new Move(gen, 'Focus Blast'),
    BitterBlade : new Move(gen, 'Bitter Blade'),
    ShadowSneak : new Move(gen, 'Shadow Sneak'),
    ShadowBall : new Move(gen, 'Shadow Ball'),
    MakeItRain : new Move(gen, 'Make It Rain'),
    IceBeam : new Move(gen, 'Ice Beam'),
    MuddyWater : new Move(gen, 'Muddy Water'),
    WoodHammer : new Move(gen, 'Wood Hammer'),
    GrassyGlide : new Move(gen, 'Grassy Glide'),
    CC : new Move(gen, 'Close Combat'),
    BraveBird : new Move(gen, 'Brave Bird'),
}

lorenzoTeam.Raichu.linkSpreads(lorenzoTeam.YChu);
lorenzoTeam.Staraptor.linkSpreads(lorenzoTeam.MegaStaraptor);
