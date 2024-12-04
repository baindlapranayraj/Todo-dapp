/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/todo_dapp.json`.
 */
export type TodoDapp = {
    "address": "Cfn4iuNeGA18mo5xMGkiFpPFxiyt88gbtUJtRf2D9nTy",
    "metadata": {
      "name": "todoDapp",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "createTodo",
        "discriminator": [
          250,
          161,
          142,
          148,
          131,
          48,
          194,
          181
        ],
        "accounts": [
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "userProfile"
            ]
          },
          {
            "name": "userProfile",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    85,
                    83,
                    69,
                    82,
                    95,
                    83,
                    84,
                    65,
                    84,
                    69
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "todoAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    84,
                    79,
                    68,
                    79,
                    95,
                    65,
                    67,
                    67,
                    79,
                    85,
                    78,
                    84
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                },
                {
                  "kind": "account",
                  "path": "user_profile.current_todo_index",
                  "account": "userProfile"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "content",
            "type": "string"
          }
        ]
      },
      {
        "name": "initializeUser",
        "discriminator": [
          111,
          17,
          185,
          250,
          60,
          122,
          38,
          254
        ],
        "accounts": [
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "userProfile",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    85,
                    83,
                    69,
                    82,
                    95,
                    83,
                    84,
                    65,
                    84,
                    69
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "markTodo",
        "discriminator": [
          70,
          24,
          206,
          243,
          92,
          29,
          249,
          110
        ],
        "accounts": [
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "todoAccount"
            ]
          },
          {
            "name": "todoAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    84,
                    79,
                    68,
                    79,
                    95,
                    65,
                    67,
                    67,
                    79,
                    85,
                    78,
                    84
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                },
                {
                  "kind": "arg",
                  "path": "todoIdx"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "todoIdx",
            "type": "u8"
          }
        ]
      },
      {
        "name": "removeTodo",
        "discriminator": [
          28,
          167,
          91,
          69,
          25,
          225,
          253,
          117
        ],
        "accounts": [
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "userProfile",
              "todoAccount"
            ]
          },
          {
            "name": "userProfile",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    85,
                    83,
                    69,
                    82,
                    95,
                    83,
                    84,
                    65,
                    84,
                    69
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "todoAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    84,
                    79,
                    68,
                    79,
                    95,
                    65,
                    67,
                    67,
                    79,
                    85,
                    78,
                    84
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                },
                {
                  "kind": "arg",
                  "path": "todoIdx"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "todoIdx",
            "type": "u8"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "todoAccount",
        "discriminator": [
          31,
          86,
          84,
          40,
          187,
          31,
          251,
          132
        ]
      },
      {
        "name": "userProfile",
        "discriminator": [
          32,
          37,
          119,
          205,
          179,
          180,
          13,
          194
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "alreadyMarked",
        "msg": "You have already marked this todo"
      }
    ],
    "types": [
      {
        "name": "todoAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "content",
              "type": "string"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "idx",
              "type": "u8"
            },
            {
              "name": "markedBool",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "userProfile",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "currentTodoIndex",
              "type": "u8"
            },
            {
              "name": "totalTodo",
              "type": "u8"
            }
          ]
        }
      }
    ],
    "constants": [
      {
        "name": "todoTag",
        "type": "bytes",
        "value": "[84, 79, 68, 79, 95, 65, 67, 67, 79, 85, 78, 84]"
      },
      {
        "name": "userTag",
        "type": "bytes",
        "value": "[85, 83, 69, 82, 95, 83, 84, 65, 84, 69]"
      }
    ]
  };
  