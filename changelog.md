Changelog
=========

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



