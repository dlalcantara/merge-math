Version 0.3.0

Numbers can now be converted into Generators
* Create a "Convert to Generator" button, layout should be between Merge All Numbers and Clear Numbers Button
  * When clicked and a Number is selected:
    * Create a Generator in the Generator Grid.  Value is equal to the currently selected number.
    * Remove the selected Number from the Numbers Grid
    * Increase Action by one.
    * Make sure to include this in undoable actions

* Remove Merge from Generators Grid
  * Instead, when a generator is already selected and then the user clicks on another generator, just change the selection to the clicked generator.  No change in action score, no movement in the grid.
  * Retain move and generate actions in the Generator Grid

* Remove Generate Generator button

* Rename "Clear Generators" to "Reset Generators Grid".  Instead of clearing all generators, clear all and then create a generator containing the number 1.

Enhance Targets Display

* Targets are no longer removed from the list.
* Instead display each target as 3 states:
  * Not yet accomplished - Starting state of targets
  * Available in Numbers Grid - Display this in such a way that users are interested to click on the target
  * Accomplished

* Now, when user clicks on a target that has a number in the Numbers Grid:
  * No change in Action count
  * Do not remove the number from the Numbers grid
  * Target status is now "Accomplished"

* Game ends when all targets are Accomplished

Starting Target List

* Target List now only contain 8 numbers

* Initial List should contain: 1, 2, 5, 12, 25, 67, 69, -420
  * These numbers are selected as a tutorial for new players

* In the first screen, add a randomize button, allowing players to randomly generate the targets.  Behaviour should be the same as the original list generation: random numbers from -1023 to 1024 inclusive