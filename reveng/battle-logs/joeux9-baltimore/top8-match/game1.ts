import { move, heal, selfdmg, swapReset } from "../../../reveng";
import { joeTeam as jt, move_shortnames as jm } from "../joe-ots";
import { lorenzoTeam as lt, move_shortnames as lm } from "./top8-opp-ots";
import { Field } from "../../../../calc/src";

const fieldState = new Field(
    {
        gameType: 'Doubles'
    }
);
export let battleLog = [
    // indeedee + corv vs. milotic + rillaboom
   () => fieldState.terrain = 'Psychic',
   () => jt.Corv.pokemon.boosts.spd += 1,
   () => fieldState.terrain = 'Grassy',
   // indeedee out for ttar
   () => swapReset(jt.Indeedee),
   () => fieldState.weather = 'Sand',
   () => move(lt.Rilla, jt.Ttar, lm.FO, 93, fieldState),
   () => jt.Corv.pokemon.boosts.atk += 1,
   () => jt.Corv.pokemon.boosts.def += 1,
   () => lt.Milo.pokemon.boosts.atk += 1,
   () => lt.Milo.pokemon.boosts.def += 1,
   // milo sand damage unclear from recording
   () => selfdmg(lt.Rilla, 93, 16),
   // terrain, speed order unclear
   () => heal(jt.Ttar, 98, 4),
   () => heal(lt.Rilla, 100, 4),
   // TURN 2
   // staraptor in for rilla
   () => swapReset(lt.Rilla),
   () => jt.Ttar.pokemon.boosts.atk -= 1,
   () => lt.Staraptor.pokemon.boosts.atk -= 1,
   // ttar mega evolves
   () => move(jt.MegaTtar, lt.Milo, jm.KnockOff, 79, fieldState),
   () => lt.Milo.pokemon.item = undefined,
   () => move(jt.Corv, lt.Staraptor, jm.BraveBird, 25, fieldState, true, 3, 76),
   // sand
   () => selfdmg(lt.Staraptor, 18, 16),
   () => selfdmg(lt.Milo, 73, 16),
   // terrain
   () => heal(jt.MegaTtar, 100, 4),
   () => heal(lt.Milo, 79, 4),
   // TURN 3
   // staraptor mega evolves, uses tailwind
   () => move(lt.Milo, jt.Corv, lm.MuddyWater, 64, fieldState),
   () => move(lt.Milo, jt.MegaTtar, lm.MuddyWater, 73, fieldState),
   () => move(jt.MegaTtar, lt.MegaStaraptor, jm.RockSlide, 0, fieldState),
   // no new info from milo sand/heal
   () => heal(jt.MegaTtar, 79, 4),
   // TURN 4
   () => lt.Ghold.pokemon.boosts.spa += 2,
   () => move(jt.MegaTtar, lt.Ghold, jm.KnockOff, 25, fieldState),
   () => lt.Ghold.pokemon.item = undefined,
   // no new info from milo sand/heal
   // terrain
   () => heal(lt.Ghold, 31, 4),
   () => heal(jt.MegaTtar, 85, 4),
   // TURN 5
   () => move(lt.Ghold, jt.Corv, lm.ShadowBall, 12, fieldState),
   () => move(lt.Milo, jt.Corv, lm.MuddyWater, 0, fieldState),
   () => move(lt.Milo, jt.MegaTtar, lm.MuddyWater, 58, fieldState),
   // sand ends
   () => fieldState.weather = undefined,
   // terrain
   () => heal(lt.Ghold, 37, 4),
   () => heal(lt.Milo, 85, 4),
   () => heal(jt.MegaTtar, 64, 4),
   // terrain ends
   // TURN 6
   // excadrill in for corv
   () => lt.Milo.pokemon.boosts.atk += 1,
   () => lt.Milo.pokemon.boosts.def += 1,
   // TURN 7
   () => move(jt.Exca, lt.Milo, jm.RockSlide, 76, fieldState),
   () => move(jt.Exca, lt.Ghold, jm.RockSlide, 26, fieldState),
   () => move(jt.MegaTtar, lt.Ghold, jm.KnockOff, 0, fieldState),
   () => move(lt.Milo, jt.Exca, lm.MuddyWater, 37, fieldState),
   () => move(lt.Milo, jt.MegaTtar, lm.MuddyWater, 25, fieldState),
   // TURN 8
   // Rillaboom in
   () => fieldState.terrain = 'Grassy',
   () => move(jt.MegaTtar, lt.Rilla, jm.KnockOff, 60, fieldState),
   () => lt.Rilla.pokemon.item = undefined,
   () => move(lt.Rilla, jt.MegaTtar, lm.WoodHammer, 0, fieldState, true, 3, 52),
   // terrain
   () => heal(jt.Exca, 43, 4),
   () => heal(lt.Rilla, 58, 4),
   () => heal(lt.Milo, 82, 4),
   // TURN 9
   // indeedee in
   () => fieldState.terrain = 'Psychic',
   () => move(jt.Indeedee, lt.Milo, jm.EForce, 43, fieldState),
   () => move(jt.Indeedee, lt.Rilla, jm.EForce, 0, fieldState),
   () => move(jt.Exca, lt.Milo, jm.IronHead, 34, fieldState),
   () => move(lt.Milo, jt.Exca, lm.MuddyWater, 0, fieldState),
   () => lm.MuddyWater.isCrit = true,
   () => move(lt.Milo, jt.Indeedee, lm.MuddyWater, 53, fieldState),
   () => lm.MuddyWater.isCrit = false,
   () => fieldState.gameType = 'Singles', // 1v1
   // TURN 10
   () => jm.EForce.isCrit = true,
   () => move(jt.Indeedee, lt.Milo, jm.EForce, 0, fieldState),
   () => jm.EForce.isCrit = false,
]
