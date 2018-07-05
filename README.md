# Lockdown

Lockdown is an extension to server-side runtimes that maintains the integrity of web applications. With Lockdown,
the runtime checks the hash of each file before executing it against a list of hashes generated before the
application is deployed to a production server. This integrity check prevents Remote Code Execution vulnerabilities
that are common with server-side scripting languages.

# Lockdown Node.js example

This is a simple example to demonstrate how to work with a Lockdown-enabled node. This code simply takes
command line arguments and outputs even, odd, or NaN for each input.

Our example depends on 4 popular npm packages in total which we need to obtain hashes for. Some packages
are dynamically required depending on the input. The code needs at least a single input to
require `is-number`, and the code would require `is-even` only if one of the inputs is indeed a number.

This means that simply running the code in the special hash generation mode is not enough to get all
the hashes of all the .js files the code depends on.

Even though our example only depends on 4 packages, our `node_modules` directory already has 14 different
modules and a total of 34 .js files. Some npm packages come with their test files (e.g. minimist)
which we do not want to include in our TCB.

Generating hashes for all the files that an application depends on while keeping the TCB as small as possible is
challenging and there are different approaches each with their own shortcomings.

One approach, for example, is to write a script that requires each and every .js file our example depends
on and run it in the hash generation mode but this is very challenging as the number of files grows very
quickly with more dependencies. Additionally, if we simply require the modules themselves we could miss
dynamically required dependencies in these modules. This approach, however, is suitable for generating
hashes for the internal node modules such as `fs` or `process`.

Another approach we will explain for this example is to use Webpack with our own custom loader to only
generate the hashes for the files our code depends on without any extra files. We will combine this
approach with the previous approach to get both the internal hashes as well as our code hashes.

## Hash generation

### Internal node modules

- We run node in the hash generation mode with the flag `--lockdown-gen-hashes` and require all
  the node internal modules.

```console
$ node --lockdown-gen-hashes modules.js
Lockdown :: events.js :: f6c4ec1f5d3899866462b65a6746b77eeba6d4736836e8c94d258e9bb1fb210a
Lockdown :: internal/async_hooks.js :: 1b5cb9e96f6941ee9f32f3df38d925f5a482e13965f82f9545fa7793af9c7024
Lockdown :: internal/errors.js :: d44471a1b02a00406a59ffbf9889e06ab62e00c1f0fade194885e8eea5970d36
Lockdown :: util.js :: 4ebae400554d23853f576e4173167c766dc1c88fa3a8cad62a9c982037d8d03a
Lockdown :: internal/encoding.js :: 00e06e0efdeac644d8278dfe67195766e6b19928cc7f266bf334ac731ad81227
...
  ```

- These modules do not change often so we only need to generate their hashes once. In fact, these hashes
  could be made available publicly online or bundled with node itself.

### Application and node_modules (Webpack)

- We rely on Webpack to resolve all the dependencies and use a custom loader that generates hashes for each
  dependency. A simple Webpack config file for this example code is provided in the repository

- We combine the hashes generated by Webpack with the hashes for the internal node modules in one file and
  run node with this file

- Our example has a total of 35 .js files (index.js and 34 in `node_modules`) but Webpack found
  only 19 .js files that our code needs and generated hashes for them

## Running the code with Lockdown

- There are two ways to run node and specify the file that contains the hashes which enables Lockdown hash checking.
  We can either use the flag `--lockdown-hashfile=` or the environment variable `LOCKDOWN_HASHFILE` as shown below:

```console
$ node --lockdown-hashfile=./hashlock index.js a 1
The input a is NaN
The input 1 is odd
$ LOCKDOWN_HASHFILE=./hashlock node index.js a 1
The input a is NaN
The input 1 is odd
```

## Integrity violation

- When one of the files that our code depends on changes (e.g. an attacker injects malicious code), node is able
  to detect that and crash

- Below is an example of a hash violation detected by node for one of the files in our `node_modules`:

```console
$ node --lockdown-hashfile=./hashlock index.js a 1
The input a is NaN
Lockdown :: hash not found for file: ./node_modules/is-odd/index.js
node[31105]: ../src/node_contextify.cc:649:static void node::contextify::ContextifyScript::New(const v8::FunctionCallbackInfo<v8::Value>&): Assertion `false' failed.
 1: 0x8b93f0 node::Abort() [node]
 2: 0x8b94df  [node]
 3: 0x8ec598 node::contextify::ContextifyScript::New(v8::FunctionCallbackInfo<v8::Value> const&) [node]
 4: 0xb3db6f  [node]
 5: 0xb3fb72 v8::internal::Builtin_HandleApiCall(int, v8::internal::Object**, v8::internal::Isolate*) [node]
 6: 0x30c0cfe041bd
Aborted (core dumped)
```
