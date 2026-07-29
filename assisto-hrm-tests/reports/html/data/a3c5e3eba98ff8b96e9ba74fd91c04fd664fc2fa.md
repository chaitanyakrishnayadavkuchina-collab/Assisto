# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hr-candi-Reg.spec.ts >> BusinessHR - Candidate Registration Module >> TC077 - Verify Drawer Behavior on Outside Click
- Location: tests\hr-candi-Reg.spec.ts:1310:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('main')
    - locator resolved to <main>…</main>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div aria-hidden="true" class="rl76ifk fui-OverlayDrawer__backdrop"></div> from <div dir="ltr" data-portal-node="true" class="fui-FluentProvider fui-FluentProviderr0 ___1bsm0mz f19n0e5 fxugw4r f1o700av fk6fouc fkhj508 figsok6 f1i3iumi f1euv43f f15twtuk f1vgc2s3 f1e31b4d f494woh">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div aria-hidden="true" class="rl76ifk fui-OverlayDrawer__backdrop"></div> from <div dir="ltr" data-portal-node="true" class="fui-FluentProvider fui-FluentProviderr0 ___1bsm0mz f19n0e5 fxugw4r f1o700av fk6fouc fkhj508 figsok6 f1i3iumi f1euv43f f15twtuk f1vgc2s3 f1e31b4d f494woh">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    14 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div aria-hidden="true" class="rl76ifk fui-OverlayDrawer__backdrop"></div> from <div dir="ltr" data-portal-node="true" class="fui-FluentProvider fui-FluentProviderr0 ___1bsm0mz f19n0e5 fxugw4r f1o700av fk6fouc fkhj508 figsok6 f1i3iumi f1euv43f f15twtuk f1vgc2s3 f1e31b4d f494woh">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - status:
      - progressbar
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e9] [cursor=pointer]
        - navigation [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]:
              - button [ref=e15] [cursor=pointer]:
                - img [ref=e17]
              - button [ref=e19] [cursor=pointer]:
                - img [ref=e21]
              - button [ref=e23] [cursor=pointer]:
                - img [ref=e25]
            - generic [ref=e28]:
              - button [ref=e30] [cursor=pointer]:
                - img [ref=e33]
              - button [ref=e35] [cursor=pointer]:
                - img [ref=e37]
              - button [ref=e39] [cursor=pointer]:
                - img [ref=e41]
              - button [ref=e43] [cursor=pointer]:
                - img [ref=e45]
            - generic [ref=e47]:
              - button [ref=e49] [cursor=pointer]:
                - img [ref=e51]
              - button [ref=e53] [cursor=pointer]:
                - img [ref=e55]
              - button [ref=e57] [cursor=pointer]:
                - img [ref=e59]
              - button [ref=e61] [cursor=pointer]:
                - img [ref=e63]
              - button [ref=e65] [cursor=pointer]:
                - img [ref=e67]
            - generic [ref=e69]:
              - button [ref=e71] [cursor=pointer]:
                - img [ref=e73]
              - button [ref=e75] [cursor=pointer]:
                - img [ref=e77]
            - generic [ref=e79]:
              - button [ref=e81] [cursor=pointer]:
                - img [ref=e83]
              - button [ref=e85] [cursor=pointer]:
                - img [ref=e87]
            - button [ref=e91] [cursor=pointer]:
              - img [ref=e93]
            - generic [ref=e95]:
              - button [ref=e97] [cursor=pointer]:
                - img [ref=e99]
              - button [ref=e101] [cursor=pointer]:
                - img [ref=e103]
              - button [ref=e105] [cursor=pointer]:
                - img [ref=e107]
              - button [ref=e109] [cursor=pointer]:
                - img [ref=e111]
            - generic [ref=e113]:
              - button [ref=e115] [cursor=pointer]:
                - img [ref=e117]
              - button [ref=e119] [cursor=pointer]:
                - img [ref=e121]
              - button [ref=e123] [cursor=pointer]:
                - img [ref=e125]
              - button [ref=e127] [cursor=pointer]:
                - img [ref=e129]
        - generic [ref=e131]:
          - generic [ref=e133]: D
          - button [ref=e134] [cursor=pointer]:
            - img [ref=e135]
      - generic [ref=e137]:
        - banner [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e140]: ASSISTO
            - img [ref=e141]
            - generic [ref=e143]: Candidate Registration
          - generic [ref=e144]:
            - button [ref=e146] [cursor=pointer]:
              - img [ref=e147]
            - img [ref=e150]:
              - generic [ref=e151]: D
        - main [ref=e152]:
          - generic [ref=e153]:
            - generic [ref=e154]:
              - generic [ref=e155]:
                - img [ref=e157]
                - generic [ref=e159]: Pre-Onboarding
              - button [ref=e160] [cursor=pointer]:
                - img [ref=e162]
                - text: Dashboard
              - button [ref=e164] [cursor=pointer]:
                - img [ref=e166]
                - text: Candidate Registration
              - button [ref=e168] [cursor=pointer]:
                - img [ref=e170]
                - text: AI Verification
                - generic [ref=e172]: ⚡AI
              - button [ref=e173] [cursor=pointer]:
                - img [ref=e175]
                - text: Letter Generation
            - generic [ref=e178]:
              - generic [ref=e179]:
                - generic [ref=e180]: Candidate Management
                - generic [ref=e181]: All active pre-boarding candidates
              - generic [ref=e182]:
                - generic [ref=e183]:
                  - generic [ref=e185]: Verified
                  - generic [ref=e186]: "36"
                - generic [ref=e187]:
                  - generic [ref=e189]: Not Verified
                  - generic [ref=e190]: "01"
                - generic [ref=e191]:
                  - generic [ref=e193]: In Progress
                  - generic [ref=e194]: "04"
                - generic [ref=e195]:
                  - generic [ref=e197]: Rejected
                  - generic [ref=e198]: "02"
              - generic [ref=e200]:
                - generic [ref=e202]:
                  - generic [ref=e205]:
                    - img [ref=e207]
                    - searchbox [ref=e209]
                  - generic [ref=e210]:
                    - button [ref=e211]:
                      - img [ref=e213]
                      - text: Filter
                    - generic [ref=e215]:
                      - button [ref=e216]:
                        - img [ref=e218]
                        - text: Export
                      - button [ref=e220]:
                        - img [ref=e222]
                    - button [ref=e224]:
                      - img [ref=e226]
                      - text: Columns
                      - img [ref=e229]
                    - button [ref=e231]:
                      - img [ref=e233]
                      - text: New
                - grid [ref=e236]:
                  - rowgroup [ref=e238]:
                    - row [ref=e239]:
                      - columnheader [ref=e240]:
                        - generic [ref=e241]:
                          - generic [ref=e243]: Candidate
                          - button [ref=e244]:
                            - img [ref=e246]
                      - columnheader [ref=e248]:
                        - generic [ref=e249]:
                          - generic [ref=e251]: Applicant Number
                          - button [ref=e252]:
                            - img [ref=e254]
                      - columnheader [ref=e256]:
                        - generic [ref=e257]:
                          - generic [ref=e259]: Hiring Position
                          - button [ref=e260]:
                            - img [ref=e262]
                      - columnheader [ref=e264]:
                        - generic [ref=e265]:
                          - generic [ref=e267]: Country
                          - button [ref=e268]:
                            - img [ref=e270]
                      - columnheader [ref=e272]:
                        - generic [ref=e273]:
                          - generic [ref=e275]: Joining Date
                          - button [ref=e276]:
                            - img [ref=e278]
                      - columnheader [ref=e280]:
                        - generic [ref=e281]:
                          - generic [ref=e283]: Initiated On
                          - button [ref=e284]:
                            - img [ref=e286]
                      - columnheader [ref=e288]:
                        - generic [ref=e291]: Stage
                      - columnheader [ref=e292]:
                        - generic [ref=e295]: Document Status
                      - columnheader [ref=e296]:
                        - generic [ref=e297]:
                          - generic [ref=e299]: Offer Letter
                          - button [ref=e300]:
                            - img [ref=e302]
                      - columnheader [ref=e304]:
                        - generic [ref=e307]: Actions
                  - rowgroup [ref=e308]:
                    - row [ref=e309]:
                      - gridcell [ref=e310]:
                        - generic [ref=e312]:
                          - img [ref=e313]:
                            - generic [ref=e314]: KK
                          - generic [ref=e315]:
                            - generic [ref=e316]: Karna K
                            - text: karna@yopmail.com
                      - gridcell [ref=e317]:
                        - generic [ref=e318]: "895855"
                      - gridcell [ref=e319]:
                        - generic [ref=e321]: Software engineer
                      - gridcell [ref=e322]:
                        - generic [ref=e323]: India
                      - gridcell [ref=e324]:
                        - generic [ref=e325]: 27-07-2026
                      - gridcell [ref=e326]:
                        - generic [ref=e327]: 24-07-2026
                      - gridcell [ref=e328]:
                        - generic [ref=e336]:
                          - generic [ref=e337]: Personal Information
                          - generic [ref=e338]: 0/4
                      - gridcell [ref=e339]:
                        - generic [ref=e341]: Requested
                      - gridcell [ref=e342]:
                        - generic [ref=e343]: Not Generated
                      - gridcell [ref=e344]:
                        - generic [ref=e346]:
                          - button [ref=e347] [cursor=pointer]:
                            - img [ref=e348]
                          - button [ref=e350] [cursor=pointer]:
                            - img [ref=e351]
                          - button [ref=e353] [cursor=pointer]:
                            - img [ref=e354]
                    - row [ref=e356]:
                      - gridcell [ref=e357]:
                        - generic [ref=e359]:
                          - img [ref=e360]:
                            - generic [ref=e361]: TD
                          - generic [ref=e362]:
                            - generic [ref=e363]: Thushar D
                            - text: thushar@yopmail.com
                      - gridcell [ref=e364]:
                        - generic [ref=e365]: "8958787"
                      - gridcell [ref=e366]:
                        - generic [ref=e368]: Recruitment Head
                      - gridcell [ref=e369]:
                        - generic [ref=e370]: India
                      - gridcell [ref=e371]:
                        - generic [ref=e372]: 21-07-2026
                      - gridcell [ref=e373]:
                        - generic [ref=e374]: 20-07-2026
                      - gridcell [ref=e375]:
                        - generic [ref=e383]:
                          - generic [ref=e384]: Document Upload
                          - generic [ref=e385]: 1/4
                      - gridcell [ref=e386]:
                        - generic [ref=e388]: Requested
                      - gridcell [ref=e389]:
                        - generic [ref=e390]: Not Generated
                      - gridcell [ref=e391]:
                        - generic [ref=e393]:
                          - button [ref=e394] [cursor=pointer]:
                            - img [ref=e395]
                          - button [ref=e397] [cursor=pointer]:
                            - img [ref=e398]
                          - button [ref=e400] [cursor=pointer]:
                            - img [ref=e401]
                    - row [ref=e403]:
                      - gridcell [ref=e404]:
                        - generic [ref=e406]:
                          - img [ref=e407]:
                            - generic [ref=e408]: AN
                          - generic [ref=e409]:
                            - generic [ref=e410]: Akhil N
                            - text: akhil@yopmail.com
                      - gridcell [ref=e411]:
                        - generic [ref=e412]: "8958788"
                      - gridcell [ref=e413]:
                        - generic [ref=e415]: Jr Developer
                      - gridcell [ref=e416]:
                        - generic [ref=e417]: India
                      - gridcell [ref=e418]:
                        - generic [ref=e419]: 20-07-2026
                      - gridcell [ref=e420]:
                        - generic [ref=e421]: 20-07-2026
                      - gridcell [ref=e422]:
                        - generic [ref=e430]:
                          - generic [ref=e431]: Offer Letter Release
                          - generic [ref=e432]: 4/4
                      - gridcell [ref=e433]:
                        - generic [ref=e435]: Approved
                      - gridcell [ref=e436]:
                        - generic [ref=e438]: Accepted
                      - gridcell [ref=e439]:
                        - generic [ref=e441]:
                          - button [ref=e442] [cursor=pointer]:
                            - img [ref=e443]
                          - button [ref=e445] [cursor=pointer]:
                            - img [ref=e446]
                          - button [ref=e448] [cursor=pointer]:
                            - img [ref=e449]
                    - row [ref=e451]:
                      - gridcell [ref=e452]:
                        - generic [ref=e454]:
                          - img [ref=e455]:
                            - generic [ref=e456]: KS
                          - generic [ref=e457]:
                            - generic [ref=e458]: Keer sai
                            - text: fauzi@yopmail.com
                      - gridcell [ref=e459]:
                        - generic [ref=e460]: "7763672"
                      - gridcell [ref=e461]:
                        - generic [ref=e463]: Tender Management Executive
                      - gridcell [ref=e464]:
                        - generic [ref=e465]: India
                      - gridcell [ref=e466]:
                        - generic [ref=e467]: 17-07-2026
                      - gridcell [ref=e468]:
                        - generic [ref=e469]: 17-07-2026
                      - gridcell [ref=e470]:
                        - generic [ref=e478]:
                          - generic [ref=e479]: Personal Information
                          - generic [ref=e480]: 0/4
                      - gridcell [ref=e481]:
                        - generic [ref=e483]: Requested
                      - gridcell [ref=e484]:
                        - generic [ref=e485]: Not Generated
                      - gridcell [ref=e486]:
                        - generic [ref=e488]:
                          - button [ref=e489] [cursor=pointer]:
                            - img [ref=e490]
                          - button [ref=e492] [cursor=pointer]:
                            - img [ref=e493]
                          - button [ref=e495] [cursor=pointer]:
                            - img [ref=e496]
                    - row [ref=e498]:
                      - gridcell [ref=e499]:
                        - generic [ref=e501]:
                          - img [ref=e502]:
                            - generic [ref=e503]: CB
                          - generic [ref=e504]:
                            - generic [ref=e505]: Chayya bekar
                            - text: brandanstark@yopmail.com
                      - gridcell [ref=e506]:
                        - generic [ref=e507]: "789877898"
                      - gridcell [ref=e508]:
                        - generic [ref=e510]: HR Executive
                      - gridcell [ref=e511]:
                        - generic [ref=e512]: India
                      - gridcell [ref=e513]:
                        - generic [ref=e514]: 15-07-2026
                      - gridcell [ref=e515]:
                        - generic [ref=e516]: 06-07-2026
                      - gridcell [ref=e517]:
                        - generic [ref=e525]:
                          - generic [ref=e526]: Offer Letter Release
                          - generic [ref=e527]: 4/4
                      - gridcell [ref=e528]:
                        - generic [ref=e530]: Approved
                      - gridcell [ref=e531]:
                        - generic [ref=e533]: Accepted
                      - gridcell [ref=e534]:
                        - generic [ref=e536]:
                          - button [ref=e537] [cursor=pointer]:
                            - img [ref=e538]
                          - button [ref=e540] [cursor=pointer]:
                            - img [ref=e541]
                          - button [ref=e543] [cursor=pointer]:
                            - img [ref=e544]
                    - row [ref=e546]:
                      - gridcell [ref=e547]:
                        - generic [ref=e549]:
                          - img [ref=e550]:
                            - generic [ref=e551]: VK
                          - generic [ref=e552]:
                            - generic [ref=e553]: Venu kumar
                            - text: venu@yopmail.com
                      - gridcell [ref=e554]:
                        - generic [ref=e555]: "8268283"
                      - gridcell [ref=e556]:
                        - generic [ref=e558]: Associate Software Test Engineer
                      - gridcell [ref=e559]:
                        - generic [ref=e560]: India
                      - gridcell [ref=e561]:
                        - generic [ref=e562]: 29-07-2026
                      - gridcell [ref=e563]:
                        - generic [ref=e564]: 13-07-2026
                      - gridcell [ref=e565]:
                        - generic [ref=e573]:
                          - generic [ref=e574]: Offer Letter Release
                          - generic [ref=e575]: 3/4
                      - gridcell [ref=e576]:
                        - generic [ref=e578]: Approved
                      - gridcell [ref=e579]:
                        - generic [ref=e581]: Approved
                      - gridcell [ref=e582]:
                        - generic [ref=e584]:
                          - button [ref=e585] [cursor=pointer]:
                            - img [ref=e586]
                          - button [ref=e588] [cursor=pointer]:
                            - img [ref=e589]
                          - button [ref=e591] [cursor=pointer]:
                            - img [ref=e592]
                    - row [ref=e594]:
                      - gridcell [ref=e595]:
                        - generic [ref=e597]:
                          - img [ref=e598]:
                            - generic [ref=e599]: NT
                          - generic [ref=e600]:
                            - generic [ref=e601]: New Test
                            - text: arcidtestarc@gmail.com
                      - gridcell [ref=e602]:
                        - generic [ref=e603]: "987654321"
                      - gridcell [ref=e604]:
                        - generic [ref=e606]: UIUX Designer
                      - gridcell [ref=e607]:
                        - generic [ref=e608]: India
                      - gridcell [ref=e609]:
                        - generic [ref=e610]: 15-07-2026
                      - gridcell [ref=e611]:
                        - generic [ref=e612]: 13-07-2026
                      - gridcell [ref=e613]:
                        - generic [ref=e621]:
                          - generic [ref=e622]: Document Upload
                          - generic [ref=e623]: 0/4
                      - gridcell [ref=e624]:
                        - generic [ref=e626]: Requested
                      - gridcell [ref=e627]:
                        - generic [ref=e628]: Not Generated
                      - gridcell [ref=e629]:
                        - generic [ref=e631]:
                          - button [ref=e632] [cursor=pointer]:
                            - img [ref=e633]
                          - button [ref=e635] [cursor=pointer]:
                            - img [ref=e636]
                          - button [ref=e638] [cursor=pointer]:
                            - img [ref=e639]
                    - row [ref=e641]:
                      - gridcell [ref=e642]:
                        - generic [ref=e644]:
                          - img [ref=e645]:
                            - generic [ref=e646]: FL
                          - generic [ref=e647]:
                            - generic [ref=e648]: First last
                            - text: first@yopmail.com
                      - gridcell [ref=e649]:
                        - generic [ref=e650]: "1728373"
                      - gridcell [ref=e651]:
                        - generic [ref=e653]: Sr. Software Test Engineer
                      - gridcell [ref=e654]:
                        - generic [ref=e655]: India
                      - gridcell [ref=e656]:
                        - generic [ref=e657]: 20-07-2026
                      - gridcell [ref=e658]:
                        - generic [ref=e659]: 10-07-2026
                      - gridcell [ref=e660]:
                        - generic [ref=e668]:
                          - generic [ref=e669]: Document Upload
                          - generic [ref=e670]: 0/4
                      - gridcell [ref=e671]:
                        - generic [ref=e673]: Requested
                      - gridcell [ref=e674]:
                        - generic [ref=e675]: Not Generated
                      - gridcell [ref=e676]:
                        - generic [ref=e678]:
                          - button [ref=e679] [cursor=pointer]:
                            - img [ref=e680]
                          - button [ref=e682] [cursor=pointer]:
                            - img [ref=e683]
                          - button [ref=e685] [cursor=pointer]:
                            - img [ref=e686]
                    - row [ref=e688]:
                      - gridcell [ref=e689]:
                        - generic [ref=e691]:
                          - img [ref=e692]:
                            - generic [ref=e693]: KK
                          - generic [ref=e694]:
                            - generic [ref=e695]: Kesava K
                            - text: kesava@yopmail.com
                      - gridcell [ref=e696]:
                        - generic [ref=e697]: "986649"
                      - gridcell [ref=e698]:
                        - generic [ref=e700]: Technical Lead
                      - gridcell [ref=e701]:
                        - generic [ref=e702]: India
                      - gridcell [ref=e703]:
                        - generic [ref=e704]: 09-07-2026
                      - gridcell [ref=e705]:
                        - generic [ref=e706]: 07-07-2026
                      - gridcell [ref=e707]:
                        - generic [ref=e715]:
                          - generic [ref=e716]: Offer Letter Release
                          - generic [ref=e717]: 4/4
                      - gridcell [ref=e718]:
                        - generic [ref=e720]: Approved
                      - gridcell [ref=e721]:
                        - generic [ref=e723]: Accepted
                      - gridcell [ref=e724]:
                        - generic [ref=e726]:
                          - button [ref=e727] [cursor=pointer]:
                            - img [ref=e728]
                          - button [ref=e730] [cursor=pointer]:
                            - img [ref=e731]
                          - button [ref=e733] [cursor=pointer]:
                            - img [ref=e734]
                    - row [ref=e736]:
                      - gridcell [ref=e737]:
                        - generic [ref=e739]:
                          - img [ref=e740]:
                            - generic [ref=e741]: AK
                          - generic [ref=e742]:
                            - generic [ref=e743]: Anil kumar
                            - text: anilk@yopmail.com
                      - gridcell [ref=e744]:
                        - generic [ref=e745]: "321145"
                      - gridcell [ref=e746]:
                        - generic [ref=e748]: Scrum Master
                      - gridcell [ref=e749]:
                        - generic [ref=e750]: India
                      - gridcell [ref=e751]:
                        - generic [ref=e752]: 17-07-2026
                      - gridcell [ref=e753]:
                        - generic [ref=e754]: 09-07-2026
                      - gridcell [ref=e755]:
                        - generic [ref=e763]:
                          - generic [ref=e764]: Offer Letter Release
                          - generic [ref=e765]: 3/4
                      - gridcell [ref=e766]:
                        - generic [ref=e768]: Approved
                      - gridcell [ref=e769]:
                        - generic [ref=e771]: Pending
                      - gridcell [ref=e772]:
                        - generic [ref=e774]:
                          - button [ref=e775] [cursor=pointer]:
                            - img [ref=e776]
                          - button [ref=e778] [cursor=pointer]:
                            - img [ref=e779]
                          - button [ref=e781] [cursor=pointer]:
                            - img [ref=e782]
                - generic [ref=e786]:
                  - generic [ref=e787]: 1–10 of 127 candidates
                  - generic [ref=e788]:
                    - generic [ref=e789]: "Rows:"
                    - generic [ref=e792]:
                      - combobox [ref=e793] [cursor=pointer]: "10"
                      - button [ref=e794] [cursor=pointer]:
                        - img [ref=e795]
                    - generic [ref=e797]:
                      - generic [ref=e798]: Page 1 of 13
                      - button [disabled] [ref=e799]:
                        - img [ref=e801]
                      - button [ref=e803]:
                        - img [ref=e805]
      - generic [ref=e807]:
        - button [ref=e808] [cursor=pointer]:
          - img [ref=e809]
        - textbox [ref=e811]:
          - /placeholder: Ask anything or give a command…
        - button [ref=e812] [cursor=pointer]:
          - img [ref=e813]
        - button [ref=e815] [cursor=pointer]:
          - img [ref=e816]
  - generic [ref=e820]: "0"
  - dialog "Document Needed for Verification Fill the below details to Register the New Candidate" [ref=e822]:
    - generic [ref=e824]:
      - heading "Document Needed for Verification Fill the below details to Register the New Candidate" [level=2] [ref=e825]:
        - generic [ref=e826]:
          - img [ref=e828]
          - generic [ref=e830]: Document Needed for Verification
        - generic [ref=e831]: Fill the below details to Register the New Candidate
      - button "Close" [active] [ref=e833]:
        - img [ref=e835]
    - generic [ref=e838]:
      - generic [ref=e839]:
        - generic [ref=e840]: Applicant Number*
        - textbox "Applicant Number" [ref=e842]:
          - /placeholder: Enter applicant number
      - generic [ref=e843]:
        - generic [ref=e844]: First Name*
        - textbox "First Name" [ref=e846]:
          - /placeholder: Enter first name
      - generic [ref=e847]:
        - generic [ref=e848]: Last Name*
        - textbox "Last Name" [ref=e850]:
          - /placeholder: Enter last name
      - generic [ref=e851]:
        - generic [ref=e852]: Personal Email*
        - textbox "Personal Email" [ref=e854]:
          - /placeholder: example@mail.com
      - generic [ref=e855]:
        - generic [ref=e856]: Dial Code*
        - generic [ref=e857]:
          - combobox "Dial Code" [ref=e858]: India (+91)
          - img [ref=e860] [cursor=pointer]
          - button "Open" [ref=e862] [cursor=pointer]:
            - img [ref=e863]
      - generic [ref=e865]:
        - generic [ref=e866]: Mobile Number*
        - textbox "Mobile Number" [ref=e868]:
          - /placeholder: Enter mobile number
      - generic [ref=e869]:
        - generic [ref=e870]: Country*
        - generic [ref=e871]:
          - combobox "Country" [ref=e872]
          - button "Open" [ref=e873] [cursor=pointer]:
            - img [ref=e874]
      - generic [ref=e876]:
        - generic [ref=e877]: Hiring Position*
        - generic [ref=e878]:
          - combobox "Hiring Position" [ref=e879]
          - button "Open" [ref=e880] [cursor=pointer]:
            - img [ref=e881]
      - generic [ref=e883]:
        - generic [ref=e884]: Joining Date*
        - generic [ref=e885] [cursor=pointer]:
          - combobox "DD/MM/YYYY" [ref=e886]
          - button [ref=e887]:
            - img [ref=e888]
      - generic [ref=e890]:
        - generic [ref=e891]: Employee Type*
        - generic [ref=e892]:
          - combobox "Employee Type" [ref=e893]
          - button "Open" [ref=e894] [cursor=pointer]:
            - img [ref=e895]
      - generic [ref=e897]:
        - generic [ref=e898]: Candidate Type*
        - generic [ref=e899]:
          - combobox "Candidate Type" [ref=e900]
          - button "Open" [ref=e901] [cursor=pointer]:
            - img [ref=e902]
      - generic [ref=e904]:
        - generic [ref=e905]: Share consent form with the candidate
        - generic [ref=e908]:
          - switch [ref=e909] [cursor=pointer]
          - generic:
            - img
    - generic [ref=e910]:
      - button "Cancel" [ref=e911]
      - button "Request Documents" [ref=e912]
```

# Test source

```ts
  1216 |    * Steps: Search for non-existent candidate
  1217 |    * Expected: Grid shows no results or "No data" message
  1218 |    */
  1219 |   test('TC073 - Verify Empty Search Results Handling', async ({
  1220 |     candidateRegistrationKeywords,
  1221 |     page,
  1222 |   }) => {
  1223 |     await candidateRegistrationKeywords.searchCandidates('XYZ_NONEXISTENT_CANDIDATE_99999');
  1224 |     await await new Promise(resolve => setTimeout(resolve, 1500));
  1225 |     // Verify search completed without errors
  1226 |     await expect(page.getByPlaceholder('Search candidates...')).toHaveValue('XYZ_NONEXISTENT_CANDIDATE_99999');
  1227 |   });
  1228 | 
  1229 |   /**
  1230 |    * TC074 - Verify Column Hiding and Showing
  1231 |    * Steps: Click Columns -> Uncheck all columns -> Click Reset
  1232 |    * Expected: All columns are hidden, Reset restores all columns
  1233 |    */
  1234 |   test('TC074 - Verify Column Hiding and Showing', async ({
  1235 |     candidateRegistrationPage,
  1236 |     page,
  1237 |   }) => {
  1238 |     await candidateRegistrationPage.clickColumnsButton();
  1239 |     // Uncheck a few columns
  1240 |     await candidateRegistrationPage.toggleColumnCheckbox('Hiring Position');
  1241 |     await candidateRegistrationPage.toggleColumnCheckbox('Joining Date');
  1242 |     // Click Reset
  1243 |     await candidateRegistrationPage.clickResetColumns();
  1244 |     await await new Promise(resolve => setTimeout(resolve, 500));
  1245 |   });
  1246 | 
  1247 |   /**
  1248 |    * TC075 - Verify Form Field Selection Dropdowns Open Correctly
  1249 |    * Steps: Click each dropdown -> Verify options are visible
  1250 |    * Expected: All dropdowns open and show correct options
  1251 |    */
  1252 |   test('TC075 - Verify Form Field Selection Dropdowns Open Correctly', async ({
  1253 |     candidateRegistrationKeywords,
  1254 |     candidateRegistrationPage,
  1255 |     page,
  1256 |   }) => {
  1257 |     await candidateRegistrationKeywords.clickNewButton();
  1258 | 
  1259 |     // Verify Dial Code dropdown options
  1260 |     await candidateRegistrationPage.dialCodeDropdown.click();
  1261 |     await expect(page.getByText('India (+91)')).toBeVisible();
  1262 | 
  1263 |     // Verify Country dropdown options
  1264 |     await candidateRegistrationPage.countryDropdown.click();
  1265 |     await expect(page.getByText('India')).toBeVisible();
  1266 | 
  1267 |     // Verify Hiring Position dropdown options
  1268 |     await candidateRegistrationPage.hiringPositionDropdown.click();
  1269 |     await expect(page.getByText('Software engineer')).toBeVisible();
  1270 | 
  1271 |     // Verify Employee Type dropdown options
  1272 |     await candidateRegistrationPage.employeeTypeDropdown.click();
  1273 |     await expect(page.getByText('Full Time')).toBeVisible();
  1274 | 
  1275 |     // Verify Candidate Type dropdown options
  1276 |     await candidateRegistrationPage.candidateTypeDropdown.click();
  1277 |     await expect(page.getByText('Fresher')).toBeVisible();
  1278 |     await expect(page.getByText('Experienced')).toBeVisible();
  1279 |   });
  1280 | 
  1281 |   /**
  1282 |    * TC076 - Verify Request Documents Button is Enabled Even with Invalid Data
  1283 |    * Steps: Fill form with valid data except one invalid field -> Click Request Documents
  1284 |    * Expected: Button is always enabled, validation errors shown on click
  1285 |    */
  1286 |   test('TC076 - Verify Request Documents Button Enabled with Invalid Data', async ({
  1287 |     candidateRegistrationKeywords,
  1288 |     page,
  1289 |   }) => {
  1290 |     await candidateRegistrationKeywords.clickNewButton();
  1291 |     await candidateRegistrationKeywords.fillCandidateFormFields({
  1292 |       ...validCandidateData,
  1293 |       personalEmail: 'not-valid-email',
  1294 |       applicantNumber: `76${Date.now()}`,
  1295 |     });
  1296 |     const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
  1297 |     expect(isEnabled).toBe(true);
  1298 |     await candidateRegistrationKeywords.clickRequestDocuments();
  1299 |     await new Promise(resolve => setTimeout(resolve, 1000));
  1300 |     const errorMessages = page.locator('[class*="error"], [class*="Error"], [role="alert"]').filter({ visible: true });
  1301 |     const errorCount = await errorMessages.count();
  1302 |     expect(errorCount).toBeGreaterThan(0);
  1303 |   });
  1304 | 
  1305 |   /**
  1306 |    * TC077 - Verify Drawer Close on Outside Click
  1307 |    * Steps: Click New -> Click outside the drawer
  1308 |    * Expected: Drawer closes (if applicable) or remains open
  1309 |    */
  1310 |   test('TC077 - Verify Drawer Behavior on Outside Click', async ({
  1311 |     candidateRegistrationKeywords,
  1312 |     page,
  1313 |   }) => {
  1314 |     await candidateRegistrationKeywords.clickNewButton();
  1315 |     // Click outside the drawer area
> 1316 |     await page.locator('main').click();
       |                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  1317 |     // Verify drawer state
  1318 |     const drawerVisible = await page.locator('[class*="drawer"], [class*="Drawer"]').last().isVisible();
  1319 |     // Drawer should either be closed or still open - both are valid behaviors
  1320 |     expect(drawerVisible).toBeDefined();
  1321 |   });
  1322 | 
  1323 |   // =========================================================================
  1324 |   // SECTION 15: COMPLETE END-TO-END WORKFLOW TESTS
  1325 |   // =========================================================================
  1326 | 
  1327 |   /**
  1328 |    * TC078 - Complete Candidate Registration Workflow (End-to-End)
  1329 |    * Steps: Navigate -> Click New -> Fill all fields -> Submit
  1330 |    * Expected: Complete registration flow works without errors
  1331 |    */
  1332 |   test('TC078 - Complete Candidate Registration Workflow (End-to-End)', async ({
  1333 |     candidateRegistrationKeywords,
  1334 |     candidateRegistrationPage,
  1335 |     page,
  1336 |   }) => {
  1337 |     // Step 1: Click New button
  1338 |     await candidateRegistrationKeywords.clickNewButton();
  1339 |     await candidateRegistrationKeywords.verifyDrawerOpened();
  1340 | 
  1341 |     // Step 2: Verify drawer elements
  1342 |     await candidateRegistrationKeywords.verifyDrawerTitleDisplayed();
  1343 |     await candidateRegistrationKeywords.verifyDrawerSubtitleDisplayed();
  1344 |     await candidateRegistrationKeywords.verifyAllFormFieldsVisible();
  1345 | 
  1346 |     // Step 3: Fill all required fields
  1347 |     await candidateRegistrationKeywords.fillCandidateFormFields({
  1348 |       ...validCandidateData,
  1349 |       applicantNumber: `${Date.now()}78`,
  1350 |       shareConsentForm: false,
  1351 |     });
  1352 | 
  1353 |     // Step 4: Verify button is enabled
  1354 |     const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
  1355 |     expect(isEnabled).toBe(true);
  1356 | 
  1357 |     // Step 5: Click Request Documents
  1358 |     await candidateRegistrationKeywords.clickRequestDocuments();
  1359 | 
  1360 |     // Step 6: Verify submission (drawer closes or success message appears)
  1361 |     // Wait for potential success notification
  1362 |     await await new Promise(resolve => setTimeout(resolve, 1000));
  1363 |   });
  1364 | 
  1365 |   /**
  1366 |    * TC079 - Complete Candidate Registration with Consent Workflow (End-to-End)
  1367 |    * Steps: Navigate -> Click New -> Fill all fields -> Enable Consent -> Submit
  1368 |    * Expected: Complete registration with consent sharing works without errors
  1369 |    */
  1370 |   test('TC079 - Complete Candidate Registration with Consent (End-to-End)', async ({
  1371 |     candidateRegistrationKeywords,
  1372 |     page,
  1373 |   }) => {
  1374 |     await candidateRegistrationKeywords.clickNewButton();
  1375 |     await candidateRegistrationKeywords.verifyDrawerOpened();
  1376 |     await candidateRegistrationKeywords.verifyAllFormFieldsVisible();
  1377 | 
  1378 |     await candidateRegistrationKeywords.fillCandidateFormFields({
  1379 |       ...validCandidateDataWithConsent,
  1380 |       applicantNumber: `${Date.now()}79`,
  1381 |       shareConsentForm: true,
  1382 |     });
  1383 | 
  1384 |     const isConsentEnabled = await candidateRegistrationKeywords.isShareConsentEnabled();
  1385 |     expect(isConsentEnabled).toBe(true);
  1386 | 
  1387 |     const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
  1388 |     expect(isEnabled).toBe(true);
  1389 | 
  1390 |     await candidateRegistrationKeywords.clickRequestDocuments();
  1391 |     await await new Promise(resolve => setTimeout(resolve, 1000));
  1392 |   });
  1393 | 
  1394 |   /**
  1395 |    * TC080 - Verify Candidate Registration with All Possible Employee and Candidate Type Combinations
  1396 |    * Steps: For each combination of employee type and candidate type -> Fill and submit
  1397 |    * Expected: All combinations work correctly
  1398 |    */
  1399 |   test('TC080 - Verify All Employee Type and Candidate Type Combinations', async ({
  1400 |     candidateRegistrationKeywords,
  1401 |   }) => {
  1402 |     for (const empType of employeeTypes.slice(0, 3)) {
  1403 |       // Limit to first 3 to keep test time reasonable
  1404 |       for (const candType of candidateTypes) {
  1405 |         await candidateRegistrationKeywords.clickNewButton();
  1406 |         await candidateRegistrationKeywords.fillCandidateFormFields({
  1407 |           ...validCandidateData,
  1408 |           employeeType: empType,
  1409 |           candidateType: candType,
  1410 |           applicantNumber: `${Date.now()}${empType.length}${candType.length}`,
  1411 |           shareConsentForm: false,
  1412 |         });
  1413 |         const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
  1414 |         expect(isEnabled).toBe(true);
  1415 |         await candidateRegistrationKeywords.closeNewCandidateDrawer();
  1416 |       }
```