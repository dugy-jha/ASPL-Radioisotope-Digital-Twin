# Contributing to the Radioisotope Digital Twin

Thank you for your interest in contributing to the Generic Radioisotope Production Digital Twin. As this is a physics-based engineering tool, we maintain strict standards for code integrity and auditability.

## 1. Physics Lock Policy
The **Physics Core** (`js/model.js`, `js/advancedPhysics.js`) and the **Isotope Pathway Registry** (`routing/isotopePathways.js`) are **LOCKED**. 
- Any modifications to these files require a full revalidation against analytical test cases.
- We primarily welcome contributions to the **UI layer**, **visualization**, **documentation**, and **new source/manufacturing modules**.

## 2. Developer Certificate of Origin (DCO)
To ensure that all contributions are legally cleared for inclusion in this project, we require that all commits be signed off using the Developer Certificate of Origin.

By adding a `Signed-off-by` line to your commit message, you certify the following:

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

### How to Sign-Off
Use the `-s` flag when committing:
```bash
git commit -s -m "Added manufacturing cost breakdown charts"
```

## 3. Contributor License Agreement (CLA)
For substantial contributions (e.g., new physics solvers), we may require a separate Contributor License Agreement (CLA) to be signed. Please contact the project maintainers via GitHub Issues for more information.

## 4. Development Workflow
1. Fork the repository.
2. Create a feature branch.
3. Implement your changes (ensure no changes to locked physics files).
4. Run local sanity tests: `import('./js/coreSanity.js').then(m => console.log(m.coreSanityTest()))`.
5. Submit a Pull Request with a clear description of the impact.

