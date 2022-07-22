/**
 * Extend the base Actor document by defining a custom roll data structure
 * which is ideal for the Simple system.
 *
 * @extends {Actor}
 */
export class ProwlersAndParagonsActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    super.prepareBaseData()
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    super.prepareDerivedData()

    this.__prepareCharacterData(this.data.type, this.data.data)
  }

  // Sub-method to set up Actor Types
  __prepareCharacterData(type, data) {
    console.log('__prepareCharacterData type, data:', type, data)

    switch (type) {
      case 'hero':
        return this.__prepareHero(data)

      case 'villain':
        return this.__prepareVillain(data)

      case 'foe':
        return this.__prepareFoe(data)

      case 'minion':
        return this.__prepareMinion(data)
    }
  }

  __prepareHero(data) {
    this.__baseEdge(data)
    this.__health(data)
  }

  __prepareVillain(data) {
    this.__baseEdge(data)
    this.__health(data)
  }
 
  __prepareFoe(data) {
    this.__baseEdge(data)
    this.__health(data)
  }

  __prepareMinion(data) {
    data.baseEdge = 0
  }

  __baseEdge(data) {
    const abs = data.abilities
    const per = abs.perception.value
    const agi = abs.agility.value
    const int = abs.intellect.value

    const val = per + (agi > int ? agi : int)

    data.edge.value = val
  }

  // Average of Toughness + Might OR Toughness + Willpower
  __health(data) {
    const abs = data.abilities
    const tou = abs.toughness.value
    const tm  = Math.ceil((tou + abs.might.value) / 2)
    const tw  = Math.ceil((tou + abs.willpower.value) / 2)
    const val = tm > tw ? tm : tw

    if (this.data.type === 'foe') val = Math.ceil(val / 2)

    data.health.value = val
    data.health.max   = val
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    switch (this.data.type) {
      case 'hero':
        this.__getHeroRollData(data)
        break

      case 'villain':
        this.__getVillainRollData(data)
        break

      case 'foe':
        this.__getFoeRollData(data)
        break

      case 'minion':
        this.__getMinionRollData(data)
        break
    }

    return data;
  }

  __getHeroRollData(data) {

  }

  __getVillainRollData(data) {

  }

  __getFoeRollData(data) {

  }

  __getMinionRollData(data) {

  } 
}
