Changelog
=========

v2.0.3 - Tall Cheetah (2017-02-22) 
----------------------------------------------------------------------

  - fix: Ignore insertion error for IE < Edge


v2.0.2 - Bossy Crocodile (2017-01-27) 
----------------------------------------------------------------------

  - fix: Case sensitive require (thanks Eulalie)


v2.0.1 - Meticulous Kangaroo (2016-02-09) 
----------------------------------------------------------------------

  - fix: Babel-runtime need to be installed explicitly along runtimetransform for npm v2


v2.0.0 - Malicious Dolphin (2016-02-05) 
----------------------------------------------------------------------

  - refactor: Change package.json for open-source release
  - refactor: Drop old node versions
  - refactor: Prepare open-source release


v1.29.1 - Noisy Eagle (2016-01-29) 
----------------------------------------------------------------------

  - fix: Missing change event on collection


v1.29.0 - Insolent Cheetah (2016-01-20) 
----------------------------------------------------------------------

  - feat: Add Elastomer#watchTuple to watch many keys at once


v1.28.3 - Equanimous Zebra (2016-01-14) 
----------------------------------------------------------------------

  - fix: Rivets refatoring view parse function for optimization


v1.28.2 - Munificent Kangaroo (2016-01-13) 
----------------------------------------------------------------------

  - fix: Map flag should not falsify mapped value


v1.28.1 - Delicate Bear (2015-12-22) 
----------------------------------------------------------------------

  - fix: Use a debouncer for collection change event


v1.28.0 - Speedy Fox (2015-12-22) 
----------------------------------------------------------------------

  - feat: Optimisation and performance


v1.27.0 - Lovable Camel (2015-12-21) 
----------------------------------------------------------------------

  - fix: Add event on input binding (not sure of the event name)
  - fix: Linked is set to false only when unlink method is defined
  - feat: Add elastomer.createProto() to init prototype from native HTML element


v1.26.1 - Loud Rat (2015-12-15) 
----------------------------------------------------------------------

  - fix: reset event on collection


v1.26.0 - Coldblooded Rabbit (2015-12-14) 
----------------------------------------------------------------------

  - fix: localName on pre registeredElement
  - feat: Use modified rivets implementation
  - feat: Add sub-watcher for collections
  - refactor: Copy rivets sources


v1.25.0 - Adroit Panda (2015-12-11) 
----------------------------------------------------------------------

  - feat: Add backbone like model watchy listener


v1.24.1 - Slimy Scorpion (2015-11-27) 
----------------------------------------------------------------------

  - fix: Rendering bug introduced by animation frame trick


v1.24.0 - Adorable Chimpanzee (2015-11-27) 
----------------------------------------------------------------------

  - feat: Use request animation frame to optimise rendering


v1.23.0 - Zealous Snail (2015-11-25) 
----------------------------------------------------------------------

  - feat: Expose global binders and formatters


v1.22.1 - Corrosive Hippopotamus (2015-11-06) 
----------------------------------------------------------------------

  - fix: Catch double element declaration


v1.22.0 - Friendly Kangaroo (2015-11-05) 
----------------------------------------------------------------------

  - feat: Add support for scoped model mapping
  - feat: The default scope no have a model object
  - fix: Ignore allready closed watcher


v1.21.3 - Querulous Snail (2015-10-19) 
----------------------------------------------------------------------

  - fix: Invalid variable name in warning catcher


v1.21.2 - Nocturnal Zebra (2015-10-12) 
----------------------------------------------------------------------

  - fix: Better registering error messages


v1.21.1 - Furry Ant (2015-10-04) 
----------------------------------------------------------------------

  - fix: Unbind a property never binded (like in a if)


v1.21.0 - Wordy Snake (2015-09-28) 
----------------------------------------------------------------------

  - feat: Add attribute camelcase conversion


v1.20.2 - Maternal Bee (2015-08-19) 
----------------------------------------------------------------------

  - fix: Setter/getter wrapper should go deeper in the prototype chain


v1.20.1 - Gustatory Lion (2015-08-17) 
----------------------------------------------------------------------

  - fix: binder toggle must listen click


v1.20.0 - Submissive Chimpanzee (2015-08-17) 
----------------------------------------------------------------------

  - feat: Add classList accessor on Elastomer.dom()


v1.19.1 - Effulgent Chimpanzee (2015-08-14) 
----------------------------------------------------------------------

  - fix: Elastomer.emit() does not call the right api


v1.19.0 - Candid Snake (2015-08-13) 
----------------------------------------------------------------------

  - feat: Use evenity to manage events
  - feat: Experimental mapping for flag on property and attribute
  - fix: Does not return the element constructor when prototype is provided


v1.18.0 - Intransigent Goldfish (2015-08-12) 
----------------------------------------------------------------------

  - test: Cleanup tests
  - refactor: Deprecation warning on old class binders
  - feat: Use camelCase conversion for property binding


v1.17.0 - Deadly Giraffe (2015-07-24) 
----------------------------------------------------------------------

  - fix: Fix null and undefined handling in map*
  - feat: Add Elastomer#mapFlag


v1.16.1 - Strong Hippopotamus (2015-07-23) 
----------------------------------------------------------------------

  - fix: Array function wrapper call error in watchy


v1.16.0 - Adroit Tiger (2015-07-23) 
----------------------------------------------------------------------

  - feat: Shortcut $ as a shadowRoot selector


v1.15.2 - Fluffy Sheep (2015-07-21) 
----------------------------------------------------------------------

  - fix: Sometimes rivets binding does not work


v1.15.1 - Bellicose Turtle (2015-07-21) 
----------------------------------------------------------------------

  - fix: Watchy side effect and invalid property binding
  - feat: Expose utils on main API


v1.15.0 - Propitious Dolphin (2015-07-17) 
----------------------------------------------------------------------

  - refactor: (Possible breaking change) Change the way mappers calls change callbacks
  - feat: Support larger kind of events with Elastomer#on()
  - feat: Provide a dedicated webcomponents-lite.js version


v1.14.0 - Hairy Fox (2015-07-16) 
----------------------------------------------------------------------

  - feat: Expose classList shim
  - feat: Add shadow dom id map to elasto
  - feat: Utils class management now support browser without classList
  - fix: Unimplemented api
  - fix: Do not try to go through invalid node list
  - fix: Webcomponents polyfills does not work well with commonjs environnement
  - fix: IE does not support template well enough to use is in elastoshadow
  - fix: Style binder must stay silent if the style is invalid (according to platform)
  - test: fix node removal IE does not support node.remove()


v1.13.1 - Speedy Kangaroo (2015-07-14) 
----------------------------------------------------------------------



v1.13.0 - Smelly Dolphin (2015-07-14) 
----------------------------------------------------------------------

  - feat: New observation method without O.o


v1.12.0 - Helpful Cheetah (2015-07-10) 
----------------------------------------------------------------------

  - fix: Remove on-* binder with microTask check because of performance issues
  - test: Cleanup
  - feat: Add Elastomer.once


v1.11.1 - Sensitive Crocodile (2015-07-09) 
----------------------------------------------------------------------

  - fix: Preserve shadow node


v1.11.0 - Pervasive Eagle (2015-07-08) 
----------------------------------------------------------------------

  - fix: Css raw selector must be localized
  - fix: queryselector root getter
  - feat: Add accessors to children and childNode in elastodom


v1.10.1 - Precipitate Kitten (2015-07-08) 
----------------------------------------------------------------------

  - fix: Edge case with ::content or /deep/ throw error


v1.10.0 - Malicious Dolphin (2015-07-08) 
----------------------------------------------------------------------

  - test: Add css scoping rules
  - feat: Enhance css scoping (throw deep, content and shadow)


v1.9.2 - Efficacious Bee (2015-07-07) 
----------------------------------------------------------------------

  - fix: Add a wrapper arround events handler to perform microtask after execution


v1.9.1 - Luminous Chimpanzee (2015-07-06) 
----------------------------------------------------------------------

  - fix: Deep path value observer set/get


v1.9.0 - Large Sheep (2015-07-06) 
----------------------------------------------------------------------

  - fix: Support raw css in native mode
  - fix: Fix watchy infinit change watcher bug
  - fix: Need a shadow element to prevent invalid binding
  - fix: Ignore keyframe rules
  - fix: Return querySelector value
  - fix: Call link even if there is no layout
  - test: Binding test
  - test: Prepare tests
  - feat: Expose registered element localName
  - feat: Stabilize css shim and elastomer shadow layer
  - feat: ONgoing Dom abstraction
  - feat: ONgoing Dom abstraction
  - feat: Shadow dom emulation with style scoping and content injection
  - refactor: Ongoing refactoring on elastoShadow


v1.8.2 - Cute Rat (2015-07-03) 
----------------------------------------------------------------------

  - feat: Expose registered element localName


v1.8.1 - Nosy Goat (2015-06-24) 
----------------------------------------------------------------------

  - fix: Add missing dependecy


v1.8.0 - Maternal Panda (2015-06-24) 
----------------------------------------------------------------------

  - feat: Add formatters
  - refactor: Use standard js coding style


v1.7.0 - Fast Chimpanzee (2015-04-16) 
----------------------------------------------------------------------

  - feat: Add binder toggle


v1.6.0 - Nocturnal Lobster (2015-04-15) 
----------------------------------------------------------------------

  - feat: Introduce HTMLElastomer


v1.5.1 - Mean Cheetah (2015-04-15) 
----------------------------------------------------------------------

  - fix: Bad argument usage in Elastomer.emit


v1.5.0 - Strong Cheetah (2015-04-12) 
----------------------------------------------------------------------

  - feat: Add class toggle binder
  - feat: add binder flag to toggle flag-like attribute
  - feat: Add logical formatter: not, and, or, xor


v1.4.2 - Smart Cow (2015-04-03) 
----------------------------------------------------------------------

  - fix: Add event handler does not work (addClosable() need an object not a function)


v1.4.1 - Smelly Horse (2015-04-02) 
----------------------------------------------------------------------

  - fix: Yeah! Nice one


v1.4.0 - Efficacious Frog (2015-04-02) 
----------------------------------------------------------------------

  - feat: Pass elastomer instance to created, preLink, link and unlink methods


v1.3.0 - Nocturnal Pig (2015-04-01) 
----------------------------------------------------------------------

  - feat: Add closable event method emit() on() off() on any object


v1.2.1 - Soft Bird (2015-03-20) 
----------------------------------------------------------------------

  - fix: Expose isAttached() on elastomer element


v1.2.0 - Wise Lion (2015-03-17) 
----------------------------------------------------------------------

  - feat: add setScope()


v1.1.1 - Delicate Turtle (2015-03-17) 
----------------------------------------------------------------------

  - fix: Post link only once


v1.1.0 - Furry Zebra (2015-03-17) 
----------------------------------------------------------------------

  - fix: Missing linking function
  - refactor: Remove deprecated binders (scope)
  - refactor: Use a decorator API


v1.0.0 - Lovable Dolphin (2015-03-11) 
----------------------------------------------------------------------

  - fix: Missing MapWay


v0.1.0 - Wordy Dog (2015-03-11) 
----------------------------------------------------------------------



